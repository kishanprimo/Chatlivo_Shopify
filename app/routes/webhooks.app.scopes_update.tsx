import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { ShopifySession } from "../database/models";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { payload, session, topic, shop } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    if (session) {
        await ShopifySession.update(
            { scope: current.toString() },
            { where: { id: session.id } },
        );
    }
    return new Response();
};
