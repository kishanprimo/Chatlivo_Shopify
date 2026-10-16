import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { ShopifySession } from "../database/models";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

// Mandatory GDPR compliance webhooks (customers/data_request,
// customers/redact, shop/redact). authenticate.webhook verifies the HMAC and
// throws a 401 response on a bad signature, as App Store review requires.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // shop/redact arrives 48h after uninstall: drop anything left for the shop
  if (topic === "SHOP_REDACT") {
    await ShopifySession.destroy({
      where: {
        shop,
      },
    });
  }

  try {
    const response = await chatlivoBackendFetch("/shopify/compliance", {
      shop_domain: shop,
      topic,
      payload,
    });

    if (!response.ok) {
      console.warn(
        "Backend compliance notification failed:",
        response.status,
      );
    }
  } catch (error) {
    console.warn("Could not reach backend compliance API:", error instanceof Error ? error.message : String(error));
  }

  // Always acknowledge: Shopify only needs a 200 once the HMAC is valid
  return new Response();
};
