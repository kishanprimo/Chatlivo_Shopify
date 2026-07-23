export type Role = "owner" | "agent" | "admin" | "not_assigned" | string;

export const isOwnerLevel = (role?: string | null) =>
  role === "owner" || role === "admin";
