// Server-to-server calls from this app to chatlivo-api. The backend guards
// these routes with a shared secret (SHOPIFY_INTERNAL_API_KEY there,
// CHATLIVO_INTERNAL_KEY here) — never import this file from browser code.

export const CHATLIVO_BACKEND_URL =
  process.env.CHATLIVO_BACKEND_URL || "https://api.chatlivo.com";

export function chatlivoBackendFetch(path: string, body: unknown) {
  const internalKey = process.env.CHATLIVO_INTERNAL_KEY;
  if (!internalKey) {
    throw new Error("CHATLIVO_INTERNAL_KEY is not set");
  }

  return fetch(`${CHATLIVO_BACKEND_URL}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Chatlivo-Internal-Key": internalKey,
    },
    body: JSON.stringify(body),
  });
}
