export function formatJobPostedDate(
  postedAt: string | Date | null | undefined,
  fallback?: string | Date | null
): string | null {
  const raw = postedAt ?? fallback;
  if (!raw) return null;

  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
