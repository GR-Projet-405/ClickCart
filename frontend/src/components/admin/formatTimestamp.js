/**
 * Small dashboard-specific date/label helper.
 * Keeps the compact preview readable without pulling in a date library.
 */
export default function formatTimestamp(value) {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
