import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingContext, PLAN_KEYS } from "../billing.server";
import {
  countProducts,
  searchProducts,
  type ProductSummary,
} from "../services/products.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

type Onboarding = {
  action?: string;
  message?: string;
  token?: string;
  is_user_verified?: boolean;
  is_setup_complete?: boolean;
  organization_id?: number;
  chatbot_id?: number | null;
};

type AdminContext = Awaited<ReturnType<typeof authenticate.admin>>;

// Theme app embed block: extensions/chatlivo-widget/blocks/chat-widget.liquid
const WIDGET_EMBED_HANDLE = "chat-widget";

// Shop details + offline token, as the Chatlivo backend expects them
async function getShopPayload({ admin, session }: AdminContext) {
  const shopResponse = await admin.graphql(`
    query GetShop {
      shop {
        id
        name
        email
        myshopifyDomain
        currencyCode
        timezoneAbbreviation
        shopOwnerName

        billingAddress {
          country
        }

        plan {
          displayName
        }
      }
    }
  `);

  const shopResult = await shopResponse.json();
  const shop = shopResult.data.shop;

  return {
    shop,
    payload: {
      shop_domain: shop.myshopifyDomain,
      shop_name: shop.name,
      email: shop.email,
      owner: shop.shopOwnerName,
      currency: shop.currencyCode,
      country: shop.billingAddress?.country,
      timezone: shop.timezoneAbbreviation,
      plan: shop.plan?.displayName,
      access_token: session.accessToken,
      scope: session.scope,
    },
  };
}

// Active Shopify plan name, or null on Free (or if billing can't be read)
async function getActivePlan({ admin, billing, session }: AdminContext) {
  try {
    const { isTest } = await getBillingContext(admin);
    const { appSubscriptions } = await billing.check({
      plans: PLAN_KEYS,
      isTest,
    });
    return appSubscriptions[0]?.name ?? null;
  } catch (error) {
    console.error(
      `Billing check failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const activePlan = await getActivePlan(context);

  // Never log the request or response: they carry the Shopify access token
  // and a Chatlivo login token.
  let onboarding: Onboarding;
  try {
    const { payload } = await getShopPayload(context);
    const backendResponse = await chatlivoBackendFetch(
      "/shopify/onboarding",
      payload,
    );

    const backendData = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok || !backendData?.data) {
      console.error(
        `Chatlivo onboarding failed for ${session.shop}: status ${backendResponse.status}`,
      );
      onboarding = { action: "error" };
    } else {
      onboarding = backendData.data;
    }

    // New store: create its Chatlivo workspace from the shop's details right
    // away, so the merchant lands in a working app (and the storefront widget
    // gets its key) without a separate sign-up step
    if (onboarding.action === "choose") {
      const signupResponse = await chatlivoBackendFetch(
        "/shopify/signup",
        payload,
      );
      const signupData = await signupResponse.json().catch(() => null);

      if (signupResponse.ok && signupData?.data?.action) {
        onboarding = signupData.data;
      } else {
        console.error(
          `Chatlivo auto sign-up failed for ${session.shop}: status ${signupResponse.status}`,
        );
      }
    }
  } catch (error) {
    console.error(
      `Chatlivo onboarding request failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    onboarding = { action: "error" };
  }

  // Only the one-time login link leaves the server, never the raw response
  let dashboardUrl: string | null = null;
  if (onboarding.action === "login") {
    const params = new URLSearchParams({
      token: onboarding.token ?? "",
      verified: String(onboarding.is_user_verified),
      setup: String(onboarding.is_setup_complete),
      organization_id: String(onboarding.organization_id),
      chatbot_id: String(onboarding.chatbot_id ?? ""),
    });
    dashboardUrl = `${import.meta.env.VITE_CHATLIVO_APP_URL}/shopify-login?${params.toString()}`;
  }

  // The store's catalog, which agents share in chats from the Chatlivo inbox
  let products: { count: number; items: ProductSummary[] } | null = null;
  if (onboarding.action === "login") {
    try {
      const [count, items] = await Promise.all([
        countProducts(context.admin),
        searchProducts(context.admin, "", 5, session.shop),
      ]);
      products = { count, items };
    } catch (error) {
      console.error(
        `Product preview failed for ${session.shop}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    status: onboarding.action ?? "error",
    message: onboarding.message ?? null,
    dashboardUrl,
    activePlan,
    products,
    // shopify:// links are handled by App Bridge and stay inside admin
    themeEditorUrl: `shopify://admin/themes/current/editor?context=apps&activateAppId=${process.env.SHOPIFY_API_KEY}/${WIDGET_EMBED_HANDLE}`,
  };
};

const CONNECT_ERROR = "We couldn't connect your store right now. Please try again.";

// Explicit merchant choices:
// - signup: create a new Chatlivo account; the loader then re-runs, finds the
//   store and shows it as connected.
// - connect: get a one-time token for this shop; the merchant opens the
//   Chatlivo dashboard in a new tab, where a logged-in owner/admin confirms.
export const action = async ({ request }: ActionFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent !== "signup" && intent !== "connect") {
    return { error: CONNECT_ERROR, connectUrl: null };
  }

  try {
    const { payload } = await getShopPayload(context);
    const backendResponse =
      intent === "signup"
        ? await chatlivoBackendFetch("/shopify/signup", payload)
        : await chatlivoBackendFetch("/shopify/connect-token", payload);

    const backendData = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return {
        error:
          backendResponse.status === 400 && backendData?.message
            ? backendData.message
            : CONNECT_ERROR,
        connectUrl: null,
      };
    }

    // Signup refuses when the store email already has an account
    if (backendData?.data?.action === "link_required") {
      return {
        error: backendData.data.message ?? CONNECT_ERROR,
        connectUrl: null,
      };
    }

    if (intent === "connect") {
      const token = backendData?.data?.token;
      if (!token) return { error: CONNECT_ERROR, connectUrl: null };

      const params = new URLSearchParams({
        open: "shopify",
        shopify_token: token,
      });

      return {
        error: null,
        connectUrl: `${import.meta.env.VITE_CHATLIVO_APP_URL}/settings/integration?${params.toString()}`,
      };
    }

    return { error: null, connectUrl: null };
  } catch (error) {
    console.error(
      `Chatlivo ${intent} request failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    return { error: CONNECT_ERROR, connectUrl: null };
  }
};

export default function AppIndex() {
  const { status, message, dashboardUrl, activePlan, themeEditorUrl, products } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const submittingIntent =
    fetcher.state !== "idle" ? fetcher.formData?.get("intent") : null;
  const submit = (intent: "signup" | "connect") =>
    fetcher.submit({ intent }, { method: "post" });

  const errorBanner = fetcher.data?.error && (
    <s-banner tone="critical">{fetcher.data.error}</s-banner>
  );

  if (status === "login") {
    return (
      <s-page heading="Chatlivo">
        <s-section heading="Store connection">
          <s-stack direction="inline" gap="base" alignItems="center">
            <s-badge tone="success">Connected</s-badge>
            <s-text>This store is connected to your Chatlivo account.</s-text>
          </s-stack>
        </s-section>

        <s-section heading="Chat widget">
          <s-paragraph>
            Turn on the Chatlivo embed in your theme editor, then save the
            theme. The chat widget then shows on every page of your store.
          </s-paragraph>
          <s-button variant="primary" href={themeEditorUrl} target="_top">
            Turn on chat widget
          </s-button>
        </s-section>

        {products && (
          <s-section heading="Products in chat">
            <s-paragraph>
              {products.count === 1
                ? "1 active product"
                : `${products.count} active products`}{" "}
              from your store can be shared with shoppers. In the Chatlivo
              inbox, click the product button in a chat, search, and send the
              product with its price and link.
            </s-paragraph>
            {products.items.length > 0 ? (
              <s-stack gap="small-200">
                {products.items.map((product) => (
                  <s-stack
                    key={product.id}
                    direction="inline"
                    gap="base"
                    alignItems="center"
                  >
                    {product.image && (
                      <s-thumbnail
                        src={product.image}
                        alt={product.title}
                        size="small"
                      />
                    )}
                    <s-text>{product.title}</s-text>
                    <s-text color="subdued">
                      {product.price} {product.currency}
                    </s-text>
                    {!product.available && (
                      <s-badge tone="warning">Out of stock</s-badge>
                    )}
                  </s-stack>
                ))}
              </s-stack>
            ) : (
              <s-paragraph>
                Add products in Shopify and they appear here.
              </s-paragraph>
            )}
          </s-section>
        )}

        <s-section heading="Plan">
          <s-paragraph>
            Current plan:{" "}
            {activePlan ?? "Free (1 agent, 25 conversations / month)"}
          </s-paragraph>
          <s-button href="/app/billing">View plans</s-button>
        </s-section>

        <s-section heading="Conversations">
          <s-paragraph>
            Reply to shoppers and set up your chatbot in the Chatlivo
            dashboard.
          </s-paragraph>
          {dashboardUrl && (
            <s-button href={dashboardUrl} target="_blank">
              Open Chatlivo dashboard
            </s-button>
          )}
        </s-section>
      </s-page>
    );
  }

  if (status === "error") {
    return (
      <s-page heading="Chatlivo">
        <s-banner tone="critical" heading="We couldn't reach Chatlivo">
          Please reload this page in a few minutes or contact Chatlivo
          support.
        </s-banner>
      </s-page>
    );
  }

  const connectUrl = fetcher.data?.connectUrl;

  const connectExisting = (
    <s-section heading="Already have a Chatlivo account?">
      <s-paragraph>
        Log in to Chatlivo in a new tab and confirm this store. It takes one
        click if you are already logged in.
      </s-paragraph>
      {connectUrl ? (
        <s-stack gap="base">
          <s-button variant="primary" href={connectUrl} target="_blank">
            Open Chatlivo to confirm
          </s-button>
          <s-paragraph>
            After confirming, come back here and reload this page.
          </s-paragraph>
        </s-stack>
      ) : (
        <s-button
          onClick={() => submit("connect")}
          loading={submittingIntent === "connect"}
          disabled={submittingIntent != null}
        >
          Connect existing Chatlivo account
        </s-button>
      )}
    </s-section>
  );

  if (status === "link_required") {
    return (
      <s-page heading="Connect this store to Chatlivo">
        {errorBanner}
        <s-banner tone="info">
          {message ||
            "A Chatlivo account already exists for this store's email. Log in to Chatlivo to connect this store."}
        </s-banner>
        {connectExisting}
      </s-page>
    );
  }

  return (
    <s-page heading="Connect this store to Chatlivo">
      {errorBanner}
      <s-section heading="New to Chatlivo?">
        <s-paragraph>
          Create a free Chatlivo account for this store.
        </s-paragraph>
        <s-button
          variant="primary"
          onClick={() => submit("signup")}
          loading={submittingIntent === "signup"}
          disabled={submittingIntent != null}
        >
          Create a Chatlivo account
        </s-button>
      </s-section>
      {connectExisting}
    </s-page>
  );
}

// Thrown Shopify auth responses need boundary.error; anything else gets a
// message inside admin instead of React Router's blank "Application Error"
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) return boundary.error(error);

  console.error(error);
  return (
    <s-page heading="Chatlivo">
      <s-banner tone="critical" heading="Something went wrong">
        Please reload this page. If it keeps happening, contact Chatlivo
        support.
      </s-banner>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
