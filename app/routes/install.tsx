import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop");

  if (!shop) {
    throw new Response("Missing shop parameter", {
      status: 400,
    });
  }

  const backendUrl = import.meta.env.CHATLIVO_BACKEND_URL!;

  return redirect(
    `${backendUrl}/api/shopify/install?shop=${encodeURIComponent(shop)}`,
  );
}