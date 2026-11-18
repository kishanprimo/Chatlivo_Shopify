import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

export type ProductSummary = {
  id: string;
  title: string;
  price: string;
  currency: string;
  url: string | null;
  image: string | null;
  available: boolean;
};

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  totalInventory: number | null;
  tracksInventory: boolean;
  featuredMedia: { preview: { image: { url: string } | null } | null } | null;
  priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } };
};

// Escapes a merchant/agent search term for Shopify's product search syntax
function toSearchQuery(search: string) {
  const term = search.trim().replace(/["\\]/g, "");
  const base = "status:active";
  return term ? `${base} AND title:*${term}*` : base;
}

// Active products for the chat product picker and the app home page. Only
// product data (covered by the app's products scope); no customer data.
export async function searchProducts(
  admin: Pick<AdminApiContext, "graphql">,
  search: string,
  first: number,
  shop: string,
): Promise<ProductSummary[]> {
  const response = await admin.graphql(
    `#graphql
    query ChatlivoProducts($first: Int!, $query: String) {
      products(first: $first, query: $query, sortKey: TITLE) {
        nodes {
          id
          title
          handle
          onlineStoreUrl
          totalInventory
          tracksInventory
          featuredMedia {
            preview {
              image {
                url(transform: { maxWidth: 200, maxHeight: 200 })
              }
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }`,
    { variables: { first, query: toSearchQuery(search) } },
  );

  const { data } = await response.json();
  const nodes: ProductNode[] = data?.products?.nodes ?? [];

  return nodes.map((node) => ({
    id: node.id,
    title: node.title,
    price: node.priceRangeV2.minVariantPrice.amount,
    currency: node.priceRangeV2.minVariantPrice.currencyCode,
    // Not published to the Online Store: link the product page by handle
    url: node.onlineStoreUrl ?? `https://${shop}/products/${node.handle}`,
    image: node.featuredMedia?.preview?.image?.url ?? null,
    available: !node.tracksInventory || (node.totalInventory ?? 0) > 0,
  }));
}

export async function countProducts(admin: Pick<AdminApiContext, "graphql">) {
  const response = await admin.graphql(
    `#graphql
    query ChatlivoProductsCount {
      productsCount(query: "status:active") {
        count
      }
    }`,
  );
  const { data } = await response.json();
  return (data?.productsCount?.count as number | undefined) ?? 0;
}
