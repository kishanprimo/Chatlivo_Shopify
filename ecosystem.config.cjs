// pm2 config for the Chatlivo Shopify app (production).
// `npm start` (react-router-serve) does not read .env itself, so the .env
// next to this file is loaded here and passed to the app. Values already set
// in the shell environment take precedence over .env.
const fs = require("fs");
const path = require("path");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};

  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2];
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    env[match[1]] = value;
  }
  return env;
}

const env = { ...loadEnvFile(path.join(__dirname, ".env")), ...process.env };

module.exports = {
  apps: [
    {
      name: "shopify-chatlivo",
      cwd: __dirname,
      script: "npm",
      args: "start",
      env: {
        PORT: env.PORT || 3005,
        NODE_ENV: env.NODE_ENV || "production",

        // Shopify app credentials (Dev Dashboard → Chatlivo → Settings)
        SHOPIFY_APP_URL: env.SHOPIFY_APP_URL || "https://shopify.chatlivo.com",
        SHOPIFY_API_KEY: env.SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET: env.SHOPIFY_API_SECRET,
        SCOPES:
          env.SCOPES ||
          "write_products,write_metaobjects,write_metaobject_definitions",

        // Shopify session storage
        DATABASE_URL: env.DATABASE_URL,

        // Chatlivo API (server-to-server, shared secret)
        CHATLIVO_BACKEND_URL:
          env.CHATLIVO_BACKEND_URL || "https://api.chatlivo.com",
        CHATLIVO_INTERNAL_KEY: env.CHATLIVO_INTERNAL_KEY,

        // Also baked into the client bundle at build time
        VITE_CHATLIVO_APP_URL: env.VITE_CHATLIVO_APP_URL || "https://chatlivo.com",
      },
      instances: 1,
      // npm is not a node script, so pm2 cluster mode cannot run it
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
