/**
 * Timezone utilities — single source of truth for UTC→local conversion.
 *
 * Rule: all timestamps arrive from the server/socket as UTC ISO 8601 strings
 * (e.g. "2026-06-01T10:30:00.000Z"). This module converts them to the
 * user's configured timezone for display only. Never store or send local time.
 */

/** Module-level override — set by setActiveTZ() when account settings load. */
let _activeTZ: string = "";

/**
 * Set the active timezone from account settings.
 * Call this once after the org's time_zone is fetched.
 * Pass empty string to revert to browser TZ.
 *
 * Accepts IANA names ("Asia/Kolkata") or compound strings like
 * "UTC+05:30 Asia/Kolkata" — extracts and validates the IANA part.
 */
export function setActiveTZ(tz: string): void {
  _activeTZ = sanitizeIANA(tz);
}

/**
 * Extract a valid IANA timezone identifier from a raw string.
 * Handles formats like "UTC+05:30 Asia/Kolkata" → "Asia/Kolkata".
 * Falls back to "" (browser TZ) if no valid IANA name is found.
 */
function sanitizeIANA(raw: string): string {
  if (!raw) return "";

  // Try the raw value first (already a clean IANA name)
  if (isValidIANA(raw)) return raw;

  // Split on whitespace and try each token — last one is usually the IANA name
  const tokens = raw.trim().split(/\s+/);
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (isValidIANA(tokens[i])) return tokens[i];
  }

  return "";
}

function isValidIANA(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Returns the active IANA timezone: account setting if set, else browser TZ. */
export function getLocalTZ(): string {
  return _activeTZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
}


/**
 * Parse a UTC ISO string or Date into a local Date object.
 * Returns null for invalid input — callers decide how to handle.
 */
export function parseUTC(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a UTC timestamp as a short time string in the user's timezone.
 * e.g. "10:30 AM"
 */
export function formatTime(value: string | Date | null | undefined): string {
  const d = parseUTC(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: getLocalTZ(),
  }).format(d);
}

/**
 * Format a UTC timestamp as "Jun 01, 10:30 AM" in the user's timezone.
 * Used in message lists.
 */
export function formatMessageTime(
  value: string | Date | null | undefined,
): string {
  const d = parseUTC(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: getLocalTZ(),
  }).format(d);
}

/**
 * Format a UTC timestamp for the chat sidebar:
 * - Today     → "10:30 AM"
 * - Yesterday → "Yesterday"
 * - Older     → "01/06/2026"
 */
export function formatSidebarTime(
  value: string | Date | null | undefined,
): string {
  const d = parseUTC(value);
  if (!d) return "";

  const nowLocal = new Date();

  // Compare calendar dates in local timezone
  const localDateStr = (dt: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: getLocalTZ() }).format(dt); // "YYYY-MM-DD"

  const dStr = localDateStr(d);
  const todayStr = localDateStr(nowLocal);

  const yesterday = new Date(nowLocal);
  yesterday.setDate(nowLocal.getDate() - 1);
  const yesterdayStr = localDateStr(yesterday);

  if (dStr === todayStr) {
    return formatTime(d);
  }
  if (dStr === yesterdayStr) {
    return "Yesterday";
  }

  // Older: DD/MM/YYYY
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: getLocalTZ(),
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  return `${parts.day}/${parts.month}/${parts.year}`;
}

/**
 * Format a UTC timestamp as a friendly "last seen" string:
 * - < 1 min ago   → "Last seen just now"
 * - < 1 hour ago  → "Last seen 5 minutes ago"
 * - Today         → "Last seen today at 10:45 AM"
 * - Yesterday     → "Last seen yesterday at 8:20 PM"
 * - Older         → "Last seen 01/06/2026 at 10:45 AM"
 */
export function formatLastSeen(
  value: string | Date | null | undefined,
): string {
  const d = parseUTC(value);
  if (!d) return "";

  const nowMs = Date.now();
  const diffMs = nowMs - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);

  if (diffMs < 0) {
    // Clock skew — treat as just now
    return "Last seen just now";
  }
  if (diffMin < 1) return "Last seen just now";
  if (diffMin < 60) return `Last seen ${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `Last seen ${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;

  const timeStr = formatTime(d);

  const localDateStr = (dt: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: getLocalTZ() }).format(dt);

  const dStr = localDateStr(d);
  const todayStr = localDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(new Date().getDate() - 1);
  const yesterdayStr = localDateStr(yesterday);

  if (dStr === todayStr) return `Last seen today at ${timeStr}`;
  if (dStr === yesterdayStr) return `Last seen yesterday at ${timeStr}`;

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: getLocalTZ(),
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  return `Last seen ${parts.day}/${parts.month}/${parts.year} at ${timeStr}`;
}

/**
 * Convert a UTC ISO string to a full local datetime string.
 * e.g. "Jun 1, 2026, 10:30 AM"
 */
export function utcToLocal(value: string | Date | null | undefined): string {
  const d = parseUTC(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: getLocalTZ(),
  }).format(d);
}

/**
 * Return the user's local date as "YYYY-MM-DD" for calendar/filter use.
 * Always use this instead of new Date().toISOString().slice(0,10) which gives UTC date.
 */
export function localDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: getLocalTZ() }).format(date);
}

/**
 * Convert a local "YYYY-MM-DD" calendar date string to a UTC ISO range.
 * fromDate → start of that local day in UTC
 * toDate   → end of that local day in UTC
 *
 * Used when sending date filter params to the API so the backend queries
 * the correct UTC window for the user's local day.
 */
export function localDateToUTCRange(localDate: string): {
  from: string;
  to: string;
} {
  // Parse as local midnight using the browser's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: getLocalTZ(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Build a Date at local midnight for this date string
  const [year, month, day] = localDate.split("-").map(Number);

  // Use the offset at that specific date/time in the local zone
  const localMidnight = new Date(
    `${localDate}T00:00:00`,
  );
  // Shift to UTC: find the UTC equivalent of local midnight
  const utcMidnight = localDateToUTC(year, month - 1, day, 0, 0, 0);
  const utcEndOfDay = localDateToUTC(year, month - 1, day, 23, 59, 59, 999);

  void formatter; // used for documentation only
  void localMidnight;

  return {
    from: utcMidnight.toISOString(),
    to: utcEndOfDay.toISOString(),
  };
}

/** Internal: build a UTC Date from local year/month/day/hour/min/sec. */
function localDateToUTC(
  year: number,
  month: number, // 0-based
  day: number,
  hour: number,
  min: number,
  sec: number,
  ms = 0,
): Date {
  // Create a date string that JavaScript will parse as LOCAL time
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const localStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(min)}:${pad(sec)}.${String(ms).padStart(3, "0")}`;

  // new Date("YYYY-MM-DDTHH:mm:ss.mmm") is parsed as LOCAL time in browsers
  return new Date(localStr);
}
