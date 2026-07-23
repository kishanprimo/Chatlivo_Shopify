import Cookies from "js-cookie";

interface JwtPayload {
  organization_id?: number;
  id?: number;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  if (!payload.exp) return false; // no exp = non-expiring token, let server validate
  return Date.now() / 1000 > payload.exp;
}

export function getValidToken(): string | undefined {
  const token = Cookies.get("chat_saas_auth_token");
  if (!token || isTokenExpired(token)) return undefined;
  return token;
}

export function getOrgIdFromToken(): number | undefined {
  const token = Cookies.get("chat_saas_auth_token");
  if (!token) return undefined;
  const payload = decodeJwt(token);
  const id = payload?.organization_id;
  return typeof id === "number" && id > 0 ? id : undefined;
}
