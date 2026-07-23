const COLORS = ["#25D366", "#128C7E", "#075E54", "#34B7F1", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export function colorFromString(str?: string): string {
  const s = str || "?";
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
