const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days < 30) return relative.format(-days, "day");
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
