import { NextResponse } from "next/server";
import { ensureSeeded, resetDemoSandboxOnly } from "@/db/seed";
import { REGIONS_DATA, SUBJECTS_DATA } from "@/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_REGIONAL_ALIGNMENTS,
} from "@/data/canonical-graph";
import { buildScopedWorkspacePayload } from "@/lib/workspace-query";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const workspace = await buildScopedWorkspacePayload(req);
    return NextResponse.json({
      ok: true,
      regions: REGIONS_DATA,
      subjects: SUBJECTS_DATA,
      topics: ALL_CANONICAL_TOPICS,
      alignments: ALL_REGIONAL_ALIGNMENTS,
      ...workspace,
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string };

    if (body.action === "reset_demo") {
      // Sandbox-protected reset: resets ONLY the 9 built-in demo personas, preserving real user accounts!
      await resetDemoSandboxOnly();
      return NextResponse.json({
        ok: true,
        scope: "demo_sandbox_only",
        message: "Demo sandbox personas reset cleanly (registered accounts preserved)",
      });
    }

    if (body.action === "admin_full_reseed") {
      const configuredToken = process.env.ADMIN_RESET_TOKEN?.trim();
      const providedToken = req.headers.get("x-admin-reset-token")?.trim();
      if (!configuredToken || configuredToken !== providedToken) {
        return NextResponse.json(
          { ok: false, error: "Forbidden: valid x-admin-reset-token required" },
          { status: 403 }
        );
      }
      await ensureSeeded(true);
      return NextResponse.json({ ok: true, scope: "full_database" });
    }

    return NextResponse.json(
      { ok: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
