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
import {
  countProducts,
  searchProducts,
  type ProductSummary,
} from "../services/products.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";
import {
  dashboardLoginUrl,
  getOnboarding,
  getShopPayload,
} from "../services/onboarding.server";

// One line of the "Chatlivo on your store" card: title + status badge,
// explanation, optional action on the right
function StatusRow({
  title,
  badge,
  text,
  action,
}: {
  title: string;
  badge: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <s-stack direction="inline" gap="base" justifyContent="space-between" alignItems="center">
      <s-stack gap="small-200">
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-text type="strong">{title}</s-text>
          {badge}
        </s-stack>
        <s-text color="subdued">{text}</s-text>
      </s-stack>
      {action}
    </s-stack>
  );
}

// "today", "yesterday" or "on 12 Nov"
function formatSeen(iso: string) {
  const seen = new Date(iso);
  const days = Math.floor((Date.now() - seen.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `on ${seen.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

// Theme app embed block: extensions/chatlivo-widget/blocks/chat-widget.liquid
const WIDGET_EMBED_HANDLE = "chat-widget";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const onboarding = await getOnboarding(context);
  const dashboardUrl = dashboardLoginUrl(onboarding);

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
    products,
    // Last time the storefront loaded the widget via the theme embed (from
    // chatlivo-api; null when not seen in the last 30 days)
    widgetSeenAt: onboarding.widget_last_seen_at ?? null,
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
  const {
    status,
    message,
    dashboardUrl,
    themeEditorUrl,
    products,
    widgetSeenAt,
  } = useLoaderData<typeof loader>();
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
        <s-section heading="Chatlivo on your store">
          <s-stack gap="base">
            <StatusRow
              title="Store connection"
              badge={<s-badge tone="success">Connected</s-badge>}
              text="This store is connected to your Chatlivo account."
            />

            <s-divider />

            <StatusRow
              title="Chat widget"
              badge={
                widgetSeenAt ? (
                  <s-badge tone="success">Detected</s-badge>
                ) : (
                  <s-badge tone="warning">Not detected</s-badge>
                )
              }
              text={
                widgetSeenAt
                  ? `The chat widget last loaded on your storefront ${formatSeen(widgetSeenAt)}. Shoppers can chat with you from every page.`
                  : "Chatlivo has not detected the chat widget on your store yet. Turn on the Chatlivo app embed in your theme and save, then open your store."
              }
              action={
                <s-button
                  variant={widgetSeenAt ? "secondary" : "primary"}
                  href={themeEditorUrl}
                  target="_top"
                >
                  {widgetSeenAt ? "Open theme editor" : "Turn on in theme"}
                </s-button>
              }
            />
          </s-stack>
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
