import { NextResponse } from "next/server";
import { searchJobTitles } from "@/lib/jobs/job-titles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "8", 10) || 8, 20);

  const results = searchJobTitles(q, limit);

  return NextResponse.json({ results });
}
