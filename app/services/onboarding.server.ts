import type { authenticate } from "../shopify.server";
import { chatlivoBackendFetch } from "./chatlivoBackend.server";

export type AdminContext = Awaited<ReturnType<typeof authenticate.admin>>;

export type Onboarding = {
  action?: string;
  message?: string;
  token?: string;
  is_user_verified?: boolean;
  is_setup_complete?: boolean;
  organization_id?: number;
  chatbot_id?: number | null;
  widget_last_seen_at?: string | null;
};

// Shop details + offline token, as the Chatlivo backend expects them
export async function getShopPayload({ admin, session }: AdminContext) {
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

// This store's Chatlivo account ("login" with a one-time token when
// connected). A new store gets its workspace created right away, so the
// merchant lands in a working app (and the storefront widget gets its key)
// without a separate sign-up step.
// Never log the request or response: they carry the Shopify access token and
// a Chatlivo login token.
export async function getOnboarding(context: AdminContext): Promise<Onboarding> {
  const { session } = context;
  try {
    const { payload } = await getShopPayload(context);
    const backendResponse = await chatlivoBackendFetch(
      "/shopify/onboarding",
      payload,
    );

    const backendData = await backendResponse.json().catch(() => null);

    let onboarding: Onboarding;
    if (!backendResponse.ok || !backendData?.data) {
      console.error(
        `Chatlivo onboarding failed for ${session.shop}: status ${backendResponse.status}`,
      );
      onboarding = { action: "error" };
    } else {
      onboarding = backendData.data;
    }

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

    return onboarding;
  } catch (error) {
    console.error(
      `Chatlivo onboarding request failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    return { action: "error" };
  }
}

// One-time login link into the Chatlivo dashboard; "next" must be one of the
// paths the dashboard's /shopify-login page allowlists. Only this link leaves
// the server, never the raw onboarding response.
export function dashboardLoginUrl(
  onboarding: Onboarding,
  next?: "/dashboard" | "/settings/subscription-plans",
) {
  if (onboarding.action !== "login") return null;

  const params = new URLSearchParams({
    token: onboarding.token ?? "",
    verified: String(onboarding.is_user_verified),
    setup: String(onboarding.is_setup_complete),
    organization_id: String(onboarding.organization_id),
    chatbot_id: String(onboarding.chatbot_id ?? ""),
  });
  if (next) params.set("next", next);

  return `${import.meta.env.VITE_CHATLIVO_APP_URL}/shopify-login?${params.toString()}`;
}
