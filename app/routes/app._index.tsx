import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
//import Dashboard from "../components/dashboard/Dashboard";
// import Welcome from "../components/auth/Welcome";
// import Login from "../components/auth/Login";

import { useLoaderData } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("=================================");
  console.log("APP INDEX LOADER HIT");
  console.log("URL:", request.url);
  console.log("=================================");
  console.log("STEP 1 -> Authenticating with Shopify...");
  const { admin, session } = await authenticate.admin(request);
  console.log("✅ Shopify Authentication Successful");

  console.log("Shop:", session.shop);
  console.log("Scopes:", session.scope);
  console.log("Access Token Exists:", !!session.accessToken);
  // 1. Fetch shop information from Shopify
  console.log("STEP 2 -> Calling Shopify GraphQL...");
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
  console.log("✅ GraphQL Success");

  console.dir(shopResult, {
    depth: null,
  });
  const shop = shopResult.data.shop;

  // 2. Send shop details to Chatlivo backend
  // const backendResponse = await fetch(
  //   `${process.env.CHATLIVO_BACKEND_URL}/api/shopify/onboarding`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "ngrok-skip-browser-warning": "true",
  //     },
  //     body: JSON.stringify({
  //       shop_domain: shop.myshopifyDomain,
  //       shop_name: shop.name,
  //       email: shop.email,
  //       owner: shop.shopOwnerName,
  //       currency: shop.currencyCode,
  //       country: shop.billingAddress?.country,
  //       timezone: shop.timezoneAbbreviation,
  //       plan: shop.plan?.displayName,
  //       access_token: session.accessToken,
  //       scope: session.scope,
  //     }),
  //   },
  // );

  // const backendData = await backendResponse.json();
  const backendResponse = await fetch(
    `${process.env.CHATLIVO_BACKEND_URL}/api/shopify/onboarding`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    }
  );

  console.log("Backend Status:", backendResponse.status);

  const rawResponse = await backendResponse.text();

  console.log("Backend Raw Response:");
  console.log(rawResponse);

  let backendData;

  try {
    backendData = JSON.parse(rawResponse);
  } catch (e) {
    console.error("JSON Parse Failed");
    throw e;
  }
  console.log("BACKEND RESPONSE:");
  console.dir(backendData, { depth: null });
  const onboarding = backendData.data;

  console.log("Onboarding:");

  console.dir(onboarding, {
    depth: null,
  });

  return {
    shop,
    onboarding,
  };
};

export default function AppIndex() {
  const { shop, onboarding } = useLoaderData<typeof loader>();

  console.log("SHOPIFY SHOP", shop);
  console.log("ONBOARDING", onboarding);
  useEffect(() => {
    if (onboarding.action !== "login") return;

    const params = new URLSearchParams({
      token: onboarding.token,
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
  if (onboarding.action === "signup") {
    return (
      <div
        style={{
          padding: 40,
          fontSize: 20,
        }}
      >
        Shopify Signup Screen
      </div>
    );
  }

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