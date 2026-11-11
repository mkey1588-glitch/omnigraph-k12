import { NextResponse } from "next/server";
import { buildScopedWorkspacePayload } from "@/lib/workspace-query";

export const dynamic = "force-dynamic";

/**
 * Tenant-Scoped Dynamic Workspace Endpoint.
 * Returns only authorized student/classroom/family records for the signed `omni_session` cookie.
 */
export async function GET(req: Request) {
  try {
    const workspace = await buildScopedWorkspacePayload(req);
    return NextResponse.json(
      {
        ok: true,
        ...workspace,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Workspace API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
