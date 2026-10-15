

export function formatDate(value) {
  if (!value) return "Unfinished";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
