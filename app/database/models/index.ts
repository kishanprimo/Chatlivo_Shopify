import sequelize from "../../db.server";
import { initShopifySession } from "./ShopifySession";

initShopifySession(sequelize);

export { ShopifySession } from "./ShopifySession";