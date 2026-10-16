// import { Session } from "@shopify/shopify-api";
// import type { SessionStorage } from "@shopify/shopify-app-session-storage/dist/ts/types";

// import ShopifySession from "../database/models/ShopifySession";
// export class SequelizeSessionStorage implements SessionStorage {
//     export class SequelizeSessionStorage implements SessionStorage {
// }
// }

// import ShopifySession from "../database/models/ShopifySession";
import { ShopifySession } from "../database/models";
import { Session } from "@shopify/shopify-api";
import type { SessionStorage } from "@shopify/shopify-app-session-storage/dist/ts/types";


export class SequelizeSessionStorage implements SessionStorage {
    async storeSession(session: Session): Promise<boolean> {
        try {
            await ShopifySession.upsert({
                id: session.id,
                shop: session.shop,
                state: session.state,
                is_online: session.isOnline,

                scope: session.scope ?? null,
                expires: session.expires ?? null,

                access_token: session.accessToken ?? "",

                refresh_token: session.refreshToken ?? null,

                refresh_token_expires:
                    session.refreshTokenExpires ?? null,
            });

            return true;
        } catch (error) {
            // Message only — a full Sequelize error can carry the query
            // parameters, which include the access token
            console.error(
                "Failed to store Shopify session:",
                error instanceof Error ? error.message : String(error),
            );
            return false;
        }
    }

    async loadSession(id: string): Promise<Session | undefined> {
        try {
            const record = await ShopifySession.findByPk(id);

            if (!record) {
                return undefined;
            }

            const session = new Session({
                id: record.id,
                shop: record.shop,
                state: record.state,
                isOnline: record.is_online,
            });

            session.scope = record.scope ?? undefined;
            session.expires = record.expires ?? undefined;
            session.accessToken = record.access_token;

            session.refreshToken = record.refresh_token ?? undefined;
            session.refreshTokenExpires =
                record.refresh_token_expires ?? undefined;

            return session;
        } catch (error) {
            console.error("Failed to load Shopify session:", error);
            return undefined;
        }
    }

    async deleteSession(id: string): Promise<boolean> {
        try {
            const deleted = await ShopifySession.destroy({
                where: { id },
            });

            return deleted > 0;
        } catch (error) {
            console.error("Failed to delete Shopify session:", error);
            return false;
        }
    }

    async deleteSessions(ids: string[]): Promise<boolean> {
        try {
            await ShopifySession.destroy({
                where: {
                    id: ids,
                },
            });

            return true;
        } catch (error) {
            console.error("Failed to delete Shopify sessions:", error);
            return false;
        }
    }

    async findSessionsByShop(shop: string): Promise<Session[]> {
        try {
            const records = await ShopifySession.findAll({
                where: { shop },
            });

            const sessions: Session[] = [];

            for (const record of records) {
                const session = await this.loadSession(record.id);

                if (session) {
                    sessions.push(session);
                }
            }

            return sessions;
        } catch (error) {
            console.error("Failed to find Shopify sessions:", error);
            return [];
        }
    }
}