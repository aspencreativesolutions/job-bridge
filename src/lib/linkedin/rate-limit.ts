import { getLinkedInRateLimitMs } from "./api-capabilities";

let lastRequestAt = 0;

/**
 * Enforces a minimum delay between LinkedIn API requests to respect
 * rate limits and LinkedIn's terms of use.
 */
export async function withLinkedInRateLimit<T>(
  fn: () => Promise<T>
): Promise<T> {
  const minInterval = getLinkedInRateLimitMs();
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  const wait = Math.max(0, minInterval - elapsed);

  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  lastRequestAt = Date.now();
  return fn();
}
