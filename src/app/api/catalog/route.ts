import { NextResponse } from "next/server";
import { REGIONS_DATA, SUBJECTS_DATA } from "@/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
} from "@/data/canonical-graph";

/**
 * Static Curriculum & Canonical Graph Catalog Endpoint (Edge / CDN Cacheable).
 * Decouples read-mostly curriculum taxonomy from per-student dynamic workspace state.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      regions: REGIONS_DATA,
      subjects: SUBJECTS_DATA,
      topics: ALL_CANONICAL_TOPICS,
      canonicalEdges: CANONICAL_EDGES,
      alignments: ALL_REGIONAL_ALIGNMENTS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
