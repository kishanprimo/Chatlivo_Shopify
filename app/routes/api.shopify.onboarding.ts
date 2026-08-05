import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const BACKEND_URL =
    `${process.env.CHATLIVO_BACKEND_URL}` || "https://api.chatlivo.com";

export async function action({
    request,
}: ActionFunctionArgs) {
    try {
        if (request.method !== "POST") {
            return Response.json(
                {
                    success: false,
                    message: "Method Not Allowed",
                },
                { status: 405 },
            );
        }

        const { admin, session } =
            await authenticate.admin(request);

        const response = await admin.graphql(`
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

        const shopData = await response.json();

        return Response.json(shopData);
    } catch (error: any) {
        return Response.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 500,
            },
        );
    }
}