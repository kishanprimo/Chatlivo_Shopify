import crypto from "crypto";
import type { LoaderFunctionArgs } from "react-router";
import { unauthenticated } from "../shopify.server";
import { searchProducts } from "../services/products.server";

// GET /internal/products?shop=<shop>.myshopify.com&q=<search>
// Server-to-server only: chatlivo-api calls this for the dashboard's product
// picker. Uses this app's offline session (refreshed automatically), since
// the token chatlivo-api stored at install expires.
// Guarded by the same shared secret the app sends to chatlivo-api.
function hasValidKey(request: Request) {
  const expected = process.env.CHATLIVO_INTERNAL_KEY;
  if (!expected) return false;

  const a = Buffer.from(request.headers.get("x-chatlivo-internal-key") || "");
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const SHOP_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!hasValidKey(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const shop = (url.searchParams.get("shop") || "").toLowerCase();
  const search = (url.searchParams.get("q") || "").slice(0, 100);

  if (!SHOP_PATTERN.test(shop)) {
    return Response.json({ error: "Invalid shop" }, { status: 400 });
  }

  let admin;
  try {
    ({ admin } = await unauthenticated.admin(shop));
  } catch {
    // No offline session: the app is not installed on this store
    return Response.json({ error: "Store not installed" }, { status: 404 });
  }

  try {
    const products = await searchProducts(admin, search, 10, shop);
    return Response.json({ products });
  } catch (error) {
    console.error(
      `Product search failed for ${shop}:`,
      error instanceof Error ? error.message : String(error),
    );
    return Response.json({ error: "Product search failed" }, { status: 502 });
  }
};
