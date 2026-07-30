import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    await db.session.deleteMany({
      where: { shop },
    });
  }

  try {
    const response = await fetch(
      `${process.env.CHATLIVO_BACKEND_URL}/shopify/uninstall`,
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
      console.error(
        "Failed to disconnect Shopify store:",
        await response.text()
      );
    } else {
      console.log(`Disconnected Shopify store: ${shop}`);
    }
  } catch (error) {
    console.error("Error calling backend uninstall API:", error);
  }

  return new Response();
};