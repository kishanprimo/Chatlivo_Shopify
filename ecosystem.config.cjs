module.exports = {
  apps: [
    {
      name: "shopify-chatlivo",
      script: "npm",
      args: "start",
      env: {
        PORT: import.meta.env.PORT || 3005,
        NODE_ENV: import.meta.env.NODE_ENV || "production",
        VITE_CHATLIVO_APP_URL: import.meta.env.VITE_CHATLIVO_APP_URL || "https://chatlivo.com",
        CHATLIVO_BACKEND_URL: import.meta.env.CHATLIVO_BACKEND_URL || "https://api.chatlivo.com",
        SHOPIFY_APP_URL: import.meta.env.SHOPIFY_APP_URL,
        SHOPIFY_API_KEY: import.meta.env.SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET: import.meta.env.SHOPIFY_API_SECRET,
        SCOPES: import.meta.env.SCOPES || "write_products,write_metaobjects,write_metaobject_definitions",
      },
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
