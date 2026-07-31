module.exports = {
  apps: [
    {
      name: "shopify-chatlivo",
      script: "npm",
      args: "start",
      env: {
        PORT: 3005,
        NODE_ENV: "production",
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
