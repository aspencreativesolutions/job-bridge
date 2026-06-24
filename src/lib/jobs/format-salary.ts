export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (min == null && max == null) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min != null) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

export interface ParsedSalaryRange {
  min?: number;
  max?: number;
}

function parseDollarAmount(raw: string): number | null {
  const normalized = raw.trim().toLowerCase().replace(/,/g, "");
  const match = normalized.match(/^(\d+(?:\.\d+)?)(k)?$/);
  if (!match) return null;

  let value = Number(match[1]);
  if (match[2]) value *= 1000;
  if (!Number.isFinite(value) || value < 1000) return null;
  return Math.round(value);
}

/**
 * Extract annual USD salary bounds from free-form job text (description, etc.).
 */
export function parseSalaryFromText(text: string): ParsedSalaryRange | null {
  if (!text.trim()) return null;

  const patterns = [
    /(?:salary|compensation|pay)\s*(?:range)?[:\s]*\$?\s*([\d,]+(?:\.\d+)?k?)\s*(?:–|-|to)\s*\$?\s*([\d,]+(?:\.\d+)?k?)/i,
    /\$\s*([\d,]+(?:\.\d+)?k?)\s*(?:–|-|to)\s*\$\s*([\d,]+(?:\.\d+)?k?)\s*(?:\/|\s*per\s*)?(?:yr|year|annually|annual)?/i,
    /(?:from|starting(?:\s+at)?)\s+\$?\s*([\d,]+(?:\.\d+)?k?)\s*(?:\/|\s*per\s*)?(?:yr|year|annually|annual)?/i,
    /up\s+to\s+\$?\s*([\d,]+(?:\.\d+)?k?)\s*(?:\/|\s*per\s*)?(?:yr|year|annually|annual)?/i,
    /\$\s*([\d,]+(?:\.\d+)?k?)\s*(?:\/|\s*per\s*)?(?:yr|year|annually|annual)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    if (match[2]) {
      const min = parseDollarAmount(match[1]);
      const max = parseDollarAmount(match[2]);
      if (min != null && max != null) {
        return { min: Math.min(min, max), max: Math.max(min, max) };
      }
    }

    const single = parseDollarAmount(match[1]);
    if (single != null) {
      if (/up\s+to/i.test(match[0])) return { max: single };
      if (/from|starting/i.test(match[0])) return { min: single };
      return { min: single, max: single };
    }
  }

  return null;
}
