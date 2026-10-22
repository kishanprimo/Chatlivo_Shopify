import type { Config } from "@react-router/dev/config";

export default {
  // react-router-serve doesn't trust X-Forwarded-Proto from nginx, so behind
  // HTTPS the request URL is http:// while the browser's Origin is https://.
  // Without this every form action fails the CSRF check with "Bad Request".
  allowedActionOrigins: ["app.chatlivo.com"],
} satisfies Config;
