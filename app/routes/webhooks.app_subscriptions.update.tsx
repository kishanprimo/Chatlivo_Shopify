import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { isPlanKey, PLANS } from "../billing.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

type AppSubscriptionPayload = {
  app_subscription?: {
    admin_graphql_api_id?: string;
    name?: string;
    status?: string;
  };
};

// app_subscriptions/update: a plan was activated, cancelled, declined,
// frozen or expired. The backend moves the organization to that plan (or
// back to Free).
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const subscription = (payload as AppSubscriptionPayload).app_subscription;
  if (!subscription?.admin_graphql_api_id || !isPlanKey(subscription.name)) {
    console.warn("Ignoring app subscription update:", subscription?.name);
    return new Response();
  }

  try {
    const response = await chatlivoBackendFetch("/shopify/billing", {
      shop_domain: shop,
      shopify_subscription_id: subscription.admin_graphql_api_id,
      status: subscription.status,
      plan_name: PLANS[subscription.name].plan_name,
      billing_cycle: PLANS[subscription.name].billing_cycle,
    });

    if (!response.ok) {
      console.warn("Backend billing sync failed:", response.status);
    }
  } catch (error) {
    console.warn("Could not reach backend billing API:", error instanceof Error ? error.message : String(error));
  }

  return new Response();
};
