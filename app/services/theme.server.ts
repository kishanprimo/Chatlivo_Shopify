import type { AdminContext } from "./onboarding.server";

// Theme app embed block: extensions/chatlivo-widget/blocks/chat-widget.liquid
export const WIDGET_EMBED_HANDLE = "chat-widget";

const MAIN_THEME_SETTINGS = `#graphql
  query MainThemeSettings {
    themes(first: 1, roles: [MAIN]) {
      nodes {
        files(filenames: ["config/settings_data.json"]) {
          nodes {
            body {
              ... on OnlineStoreThemeFileBodyText {
                content
              }
            }
          }
        }
      }
    }
  }
`;

// Is the Chatlivo app embed switched on in the live theme?
// true/false from the theme's settings_data.json; null when it cannot be
// read (read_themes not granted yet, unusual theme file, API error), so the
// caller falls back to the storefront heartbeat.
export async function isWidgetEmbedEnabled(
  admin: AdminContext["admin"],
): Promise<boolean | null> {
  try {
    const response = await admin.graphql(MAIN_THEME_SETTINGS);
    const json = (await response.json()) as {
      data?: {
        themes?: {
          nodes?: { files?: { nodes?: { body?: { content?: string } }[] } }[];
        };
      };
    };
    const content =
      json?.data?.themes?.nodes?.[0]?.files?.nodes?.[0]?.body?.content;
    if (!content) return null;

    // The file starts with a /* ... */ comment written by Shopify
    const data = JSON.parse(content.replace(/^\s*\/\*[\s\S]*?\*\//, ""));
    const blocks: Record<string, { type?: string; disabled?: boolean }> =
      data?.current?.blocks ?? {};

    // App embed types look like shopify://apps/<app>/blocks/chat-widget/<uuid>
    return Object.values(blocks).some(
      (block) =>
        typeof block?.type === "string" &&
        block.type.startsWith("shopify://apps/") &&
        block.type.includes(`/blocks/${WIDGET_EMBED_HANDLE}/`) &&
        block.disabled !== true,
    );
  } catch (error) {
    console.error(
      "App embed check failed:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
