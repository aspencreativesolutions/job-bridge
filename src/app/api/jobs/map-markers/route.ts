import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  geocodeLocations,
  reverseGeocodeLngLats,
} from "@/lib/jobs/geocode-location";
import { buildJobMapMarkers } from "@/lib/jobs/map-markers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await db.jobListing.findMany({
    where: { userId: session.user.id },
    orderBy: { discoveredAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
    },
  });

  const locations = jobs
    .map((j) => j.location?.trim())
    .filter((l): l is string => Boolean(l));

  const geocoded = await geocodeLocations(locations);
  const coords = [...geocoded.values()].filter(
    (c): c is [number, number] => c !== null
  );
  const placeNames = await reverseGeocodeLngLats(coords);
  const markers = buildJobMapMarkers(jobs, geocoded, placeNames);

  return NextResponse.json(markers);
}
