import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

// Offline (per-shop) sessions only; the app never requests online tokens,
// so Shopify staff details are not stored
export interface ShopifySessionAttributes {
  id: string;
  shop: string;
  state: string;
  is_online: boolean;

  scope?: string | null;
  expires?: Date | null;

  access_token: string;

  refresh_token?: string | null;
  refresh_token_expires?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShopifySessionCreationAttributes
  extends Optional<
    ShopifySessionAttributes,
    | "scope"
    | "expires"
    | "refresh_token"
    | "refresh_token_expires"
    | "createdAt"
    | "updatedAt"
  > {}

export class ShopifySession
  extends Model<
    ShopifySessionAttributes,
    ShopifySessionCreationAttributes
  >
  implements ShopifySessionAttributes
{
  declare id: string;
  declare shop: string;
  declare state: string;
  declare is_online: boolean;

  declare scope: string | null;
  declare expires: Date | null;

  declare access_token: string;

  declare refresh_token: string | null;
  declare refresh_token_expires: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const initShopifySession = (
  sequelize: Sequelize,
): typeof ShopifySession => {
  ShopifySession.init(
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
      },

      shop: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      state: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      is_online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      scope: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      access_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      refresh_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,

      tableName: "shopify_sessions",

      timestamps: true,

      indexes: [
        {
          fields: ["shop"],
        },
        {
          fields: ["is_online"],
        },
      ],
    },
  );

  return ShopifySession;
};

export default ShopifySession;