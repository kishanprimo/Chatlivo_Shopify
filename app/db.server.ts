import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,

  timezone: "+00:00",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    timestamps: true,
    underscored: false,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
});
/* ---------- TEMPORARY TEST ---------- */

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error(err);
  });

/* ---------- END TEMPORARY TEST ---------- */
export default sequelize;