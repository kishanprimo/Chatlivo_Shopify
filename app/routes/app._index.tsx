import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

import { Form, useActionData, useLoaderData, useNavigation } from "react-router";

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const { shop, payload } = await getShopPayload(context);

  // 2. Send shop details to Chatlivo backend.
  // Never log the request or response: they carry the Shopify access token
  // and a Chatlivo login token.
  let onboarding: Onboarding;
  try {
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
  } catch (error) {
    console.error(
      `Chatlivo onboarding request failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    onboarding = { action: "error" };
  }

  return {
    shop,
    onboarding,
  };
};

const CONNECT_ERROR = "We couldn't connect your store right now. Please try again.";

// Explicit merchant choices:
// - signup: create a new Chatlivo account; the loader then re-runs, finds the
//   store and logs the merchant in.
// - connect: get a one-time token for this shop and open the Chatlivo
//   dashboard, where a logged-in owner/admin confirms the connection.
export const action = async ({ request }: ActionFunctionArgs) => {
  const context = await authenticate.admin(request);
  const { session } = context;

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent !== "signup" && intent !== "connect") {
    return { error: CONNECT_ERROR };
  }

  const { payload } = await getShopPayload(context);

  try {
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
      };
    }

    // Signup refuses when the store email already has an account
    if (backendData?.data?.action === "link_required") {
      return { error: backendData.data.message ?? CONNECT_ERROR };
    }

    if (intent === "connect") {
      const params = new URLSearchParams({
        open: "shopify",
        shopify_token: backendData.data.token,
      });

      return {
        error: null,
        redirectUrl: `${import.meta.env.VITE_CHATLIVO_APP_URL}/settings/integration?${params.toString()}`,
      };
    }

    return { error: null };
  } catch (error) {
    console.error(
      `Chatlivo ${intent} request failed for ${session.shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    return { error: CONNECT_ERROR };
  }
};

export default function AppIndex() {
  const { onboarding } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  useEffect(() => {
    if (onboarding.action !== "login") return;

    const params = new URLSearchParams({
      token: onboarding.token ?? "",
      verified: String(onboarding.is_user_verified),
      setup: String(onboarding.is_setup_complete),
      organization_id: String(onboarding.organization_id),
      chatbot_id: String(onboarding.chatbot_id ?? ""),
    });

    const url = `${import.meta.env.VITE_CHATLIVO_APP_URL}/shopify-login?${params.toString()}`;

    if (window.top) {
      window.open(url, "_top");
    } else {
      window.location.href = url;
    }
  }, [onboarding]);

  // Leave the Shopify admin iframe for the Chatlivo dashboard
  useEffect(() => {
    if (!actionData || !("redirectUrl" in actionData) || !actionData.redirectUrl)
      return;

    window.open(actionData.redirectUrl, "_top");
  }, [actionData]);

  if (onboarding.action === "login") {
    return (
      <div
        style={{
          padding: 40,
          fontSize: 18,
        }}
      >
        Redirecting to Chatlivo...
      </div>
    );
  }

  const submittingIntent =
    navigation.state === "submitting"
      ? navigation.formData?.get("intent")
      : null;

  const connectExisting = (
    <>
      <p>
        Log in to Chatlivo and confirm this store. It takes one click if you
        are already logged in.
      </p>
      <Form method="post" style={{ marginTop: 8 }}>
        <input type="hidden" name="intent" value="connect" />
        <button
          type="submit"
          disabled={submittingIntent !== null}
          style={{ padding: "8px 16px", fontSize: 16 }}
        >
          {submittingIntent === "connect"
            ? "Opening Chatlivo..."
            : "Connect existing Chatlivo account"}
        </button>
      </Form>
    </>
  );

  const errorMessage = actionData?.error && (
    <p style={{ color: "#d72c0d", marginTop: 12 }}>{actionData.error}</p>
  );

  if (onboarding.action === "choose") {
    return (
      <div style={{ padding: 40, fontSize: 16, maxWidth: 520 }}>
        <p style={{ fontSize: 18 }}>Connect this store to Chatlivo</p>

        <h3 style={{ marginTop: 24 }}>New to Chatlivo?</h3>
        <Form method="post">
          <input type="hidden" name="intent" value="signup" />
          <button
            type="submit"
            disabled={submittingIntent !== null}
            style={{ padding: "8px 16px", fontSize: 16 }}
          >
            {submittingIntent === "signup"
              ? "Creating account..."
              : "Create a Chatlivo account"}
          </button>
        </Form>

        <h3 style={{ marginTop: 32 }}>Already have a Chatlivo account?</h3>
        {connectExisting}
        {errorMessage}
      </div>
    );
  }

  if (onboarding.action === "link_required") {
    return (
      <div style={{ padding: 40, fontSize: 16, maxWidth: 520 }}>
        <p style={{ fontSize: 18 }}>
          {onboarding.message ||
            "A Chatlivo account already exists for this store's email. Log in to Chatlivo to connect this store."}
        </p>
        {connectExisting}
        {errorMessage}
      </div>
    );
  }

  if (onboarding.action === "error") {
    return (
      <div
        style={{
          padding: 40,
          fontSize: 18,
        }}
      >
        We couldn&apos;t connect to Chatlivo right now. Please reload this page in a
        few minutes or contact Chatlivo support.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 40,
      }}
    >
      Loading...
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
