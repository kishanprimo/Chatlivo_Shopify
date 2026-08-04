import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

export interface ShopifySessionAttributes {
  id: string;
  shop: string;
  state: string;
  is_online: boolean;

  scope?: string | null;
  expires?: Date | null;

  access_token: string;

  user_id?: bigint | null;

  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;

  account_owner: boolean;

  locale?: string | null;

  collaborator: boolean;

  email_verified: boolean;

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
    | "user_id"
    | "first_name"
    | "last_name"
    | "email"
    | "locale"
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

  declare user_id: bigint | null;

  declare first_name: string | null;
  declare last_name: string | null;
  declare email: string | null;

  declare account_owner: boolean;

  declare locale: string | null;

  declare collaborator: boolean;

  declare email_verified: boolean;

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

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      account_owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      locale: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      collaborator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        {
          fields: ["user_id"],
        },
      ],
    },
  );

  return ShopifySession;
};

export default ShopifySession;