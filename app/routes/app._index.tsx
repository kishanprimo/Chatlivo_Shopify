import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  countProducts,
  searchProducts,
  type ProductSummary,
} from "../services/products.server";
import {
  chatlivoConnectUrl,
  dashboardLoginUrl,
  getOnboarding,
} from "../services/onboarding.server";
import {
  isWidgetEmbedEnabled,
  WIDGET_EMBED_HANDLE,
} from "../services/theme.server";

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const onboarding = await getOnboarding(context);

  // Not connected yet: the app page opens in admin first (Shopify requires
  // the app UI right after install), with one button to chatlivo.com where
  // the merchant logs in or registers; that connects this store and sends
  // them back here.
  let connectUrl: string | null = null;
  if (onboarding.action === "choose") {
    connectUrl = await chatlivoConnectUrl(context);
    if (!connectUrl) onboarding.action = "error";
  }

  const dashboardUrl = dashboardLoginUrl(onboarding);

  // The store's catalog, which agents share in chats from the Chatlivo inbox,
  // and whether the app embed is on in the live theme (setup step 2)
  let products: { count: number; items: ProductSummary[] } | null = null;
  let embedEnabled: boolean | null = null;
  if (onboarding.action === "login") {
    const [productsResult, embedResult] = await Promise.allSettled([
      Promise.all([
        countProducts(context.admin),
        searchProducts(context.admin, "", 5, session.shop),
      ]),
      isWidgetEmbedEnabled(context.admin),
    ]);

    if (productsResult.status === "fulfilled") {
      const [count, items] = productsResult.value;
      products = { count, items };
    } else {
      console.error(
        `Product preview failed for ${session.shop}:`,
        productsResult.reason instanceof Error
          ? productsResult.reason.message
          : String(productsResult.reason),
      );
    }
    if (embedResult.status === "fulfilled") embedEnabled = embedResult.value;
  }

  return {
    status: onboarding.action ?? "error",
    workspaceName: onboarding.organization?.name ?? null,
    storeUrl: `https://${session.shop}`,
    // true/false from the live theme; null when it could not be read
    embedEnabled,
    dashboardUrl,
    connectUrl,
    products,
    // Last time the storefront loaded the widget via the theme embed (from
    // chatlivo-api; null when not seen in the last 30 days)
    widgetSeenAt: onboarding.widget_last_seen_at ?? null,
    // shopify:// links are handled by App Bridge and stay inside admin
    themeEditorUrl: `shopify://admin/themes/current/editor?context=apps&activateAppId=${process.env.SHOPIFY_API_KEY}/${WIDGET_EMBED_HANDLE}`,
  };
};

const CONNECT_ERROR = "We couldn't connect your store right now. Please try again.";

// Connected store, "Connect existing Chatlivo account": one-time link to the
// chatlivo.com connect page for another account (confirmed there)
export const action = async ({ request }: ActionFunctionArgs) => {
  const context = await authenticate.admin(request);

  const connectUrl = await chatlivoConnectUrl(context);
  return connectUrl
    ? { error: null, connectUrl }
    : { error: CONNECT_ERROR, connectUrl: null };
};

export default function AppIndex() {
  const {
    status,
    workspaceName,
    storeUrl,
    embedEnabled,
    dashboardUrl,
    connectUrl,
    themeEditorUrl,
    products,
    widgetSeenAt,
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();

  // Back from the theme editor, the store or chatlivo.com: re-check the
  // setup steps so their status updates without a reload
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") {
        revalidator.revalidate();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitting = fetcher.state !== "idle";

  const errorBanner = fetcher.data?.error && (
    <s-banner tone="critical">{fetcher.data.error}</s-banner>
  );

  const connectExisting = (
    <ConnectExisting
      connectUrl={fetcher.data?.connectUrl}
      submitting={submitting}
      disabled={submitting}
      onConnect={() => fetcher.submit({}, { method: "post" })}
    />
  );

  if (status === "login") {
    // Step 2 uses the live theme when it can be read, otherwise the
    // storefront heartbeat (the widget only loads when the embed is on)
    const embedOn =
      embedEnabled === true || (embedEnabled === null && Boolean(widgetSeenAt));
    const liveOnStore = Boolean(widgetSeenAt);
    const doneBadge = <s-badge tone="success">Done</s-badge>;

    return (
      <s-page heading="Welcome to Chatlivo">
        {errorBanner}
        {!embedOn && (
          <s-banner tone="warning" heading="Chat widget is not live yet">
            Turn on the Chatlivo app embed in your theme and click Save, so
            shoppers can see the chat on your store.
          </s-banner>
        )}
        <s-section heading="Set up your chat">
          <s-stack gap="base">
            <StatusRow
              title="1. Connect your Chatlivo account"
              badge={doneBadge}
              text={
                workspaceName
                  ? `Connected to the Chatlivo workspace "${workspaceName}".`
                  : "This store is connected to your Chatlivo account."
              }
            />

            <s-divider />

            <StatusRow
              title="2. Turn on Chatlivo in your theme"
              badge={
                embedOn ? doneBadge : <s-badge tone="warning">Off</s-badge>
              }
              text={
                embedOn
                  ? "The Chatlivo app embed is on in your live theme."
                  : "Click the button: the theme editor opens with Chatlivo switched on. Click Save there, then come back here."
              }
              action={
                <s-button
                  variant={embedOn ? "secondary" : "primary"}
                  href={themeEditorUrl}
                  target="_top"
                >
                  {embedOn ? "Open theme editor" : "Turn on in theme editor"}
                </s-button>
              }
            />

            <s-divider />

            <StatusRow
              title="3. Check your live store"
              badge={
                liveOnStore ? (
                  <s-badge tone="success">Widget detected</s-badge>
                ) : (
                  <s-badge>To do</s-badge>
                )
              }
              text={
                liveOnStore
                  ? `The chat widget last loaded on your store ${formatSeen(widgetSeenAt!)}. Shoppers can chat with you from every page.`
                  : "Open your store and wait a moment: the chat button appears in the corner. Send a test message and it arrives in your Chatlivo inbox."
              }
              action={
                <s-button href={storeUrl} target="_blank">
                  Open store
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

        <s-section heading="Next steps">
          <s-paragraph>
            Reply to shoppers from the Chatlivo dashboard or the Chatlivo
            mobile app. In the dashboard you can also set up AI answers,
            business hours and the look of your chat widget.
          </s-paragraph>
          {dashboardUrl && (
            <s-button href={dashboardUrl} target="_blank">
              Open Chatlivo dashboard
            </s-button>
          )}
        </s-section>

        {connectExisting}
      </s-page>
    );
  }

  // Not connected: one button to chatlivo.com (log in or register there)
  if (status === "choose" && connectUrl) {
    return (
      <s-page heading="Welcome to Chatlivo">
        <s-section heading="Connect your store to Chatlivo">
          <s-stack gap="base">
            <s-paragraph>
              Log in to your Chatlivo account or create one for free on
              chatlivo.com. Your store connects automatically, your store
              domain is added as your Chatlivo website, and you come back here
              to switch the chat widget on.
            </s-paragraph>
            <s-stack direction="inline">
              <s-button variant="primary" href={connectUrl} target="_top">
                Continue to Chatlivo
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Chatlivo">
      <s-banner tone="critical" heading="We couldn't reach Chatlivo">
        Please reload this page in a few minutes or contact Chatlivo support.
      </s-banner>
    </s-page>
  );
}

// Move a connected store to another Chatlivo account: the store admin starts
// it here, a logged-in Chatlivo owner/admin confirms it on chatlivo.com
function ConnectExisting({
  connectUrl,
  submitting,
  disabled,
  onConnect,
}: {
  connectUrl: string | null | undefined;
  submitting: boolean;
  disabled: boolean;
  onConnect: () => void;
}) {
  return (
    <s-section heading="Use another Chatlivo account?">
      <s-paragraph>
        To move this store to another Chatlivo account, log in to that
        account on chatlivo.com and confirm this store. The store and its
        chat widget then switch to that account.
      </s-paragraph>
      {connectUrl ? (
        <s-stack gap="base">
          <s-button variant="primary" href={connectUrl} target="_top">
            Open Chatlivo to confirm
          </s-button>
          <s-paragraph>
            Chatlivo brings you back here once the store is connected.
          </s-paragraph>
        </s-stack>
      ) : (
        <s-button onClick={onConnect} loading={submitting} disabled={disabled}>
          Connect existing Chatlivo account
        </s-button>
      )}
    </s-section>
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
