/**
 * Background job scanner — run periodically via cron or manually:
 *   npm run worker:scan
 *
 * Or call POST /api/jobs/scan with Authorization: Bearer $CRON_SECRET
 */

async function runScan() {
  const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000/api/auth").replace(
    /\/api\/auth\/?$/,
    ""
  );
  const cronSecret = process.env.CRON_SECRET ?? "dev-cron-secret";

  const res = await fetch(`${baseUrl}/api/jobs/scan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const data = await res.json();
  console.log(`[${new Date().toISOString()}] Scan result:`, data);
}

runScan().catch(console.error);
