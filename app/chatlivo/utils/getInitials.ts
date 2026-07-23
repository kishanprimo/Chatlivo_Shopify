export function getInitials(name?: string, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (phone) return phone.slice(0, 1).toUpperCase();
  return "";
}
