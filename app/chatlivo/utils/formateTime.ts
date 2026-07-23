/**
 * Date/time formatting — all functions accept UTC timestamps and convert to
 * the user's local timezone for display only (never for storage).
 *
 * Re-exports helpers from timezone.ts so existing callers need no changes.
 */

export {
  utcToLocal,
  formatLastSeen,
  formatMessageTime as formateMessageListTime,
  formatSidebarTime,
  localDateString,
  localDateToUTCRange,
  getLocalTZ,
} from "./timezone";

// Default export kept for chatSidebarTime callers
import { formatSidebarTime } from "./timezone";
export default formatSidebarTime;
