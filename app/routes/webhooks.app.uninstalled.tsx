import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { ShopifySession } from "../database/models";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    await ShopifySession.destroy({
      where: {
        shop,
      },
    });
  }

  if (import.meta.env.CHATLIVO_BACKEND_URL) {
    try {
      const response = await fetch(
        `${import.meta.env.CHATLIVO_BACKEND_URL}/shopify/uninstall`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop_domain: shop,
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          "Backend uninstall notification failed:",
          response.status,
          await response.text()
        );
      } else {
        console.log(`Backend notified of store uninstall: ${shop}`);
      }
    } catch (error) {
      console.warn("Could not reach backend uninstall API:", error instanceof Error ? error.message : String(error));
    }
  }

  return new Response();
};