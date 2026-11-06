import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { privacyAuditLogs, users } from "@/db/schema";
import {
  generateSocraticTutorReply,
  type SocraticTutorRequest,
} from "@/lib/engines/socratic-tutor";
import { sanitizeForExternalAi } from "@/lib/engines/privacy-shield";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = (await req.json()) as SocraticTutorRequest & {
      studentId?: string;
    };

    const studentId = body.studentId || "stu_leo";
    const userRows = await db.select().from(users).where(eq(users.id, studentId));
    const displayName = userRows[0]?.displayName;

    let latestRedacted: string[] = [];
    let latestPreview = "";
    let anonToken = "";
    let regulation = "";

    const sanitizedMessages = (body.messages ?? []).map((msg) => {
      if (msg.role !== "user") return msg;
      const res = sanitizeForExternalAi({
        rawText: msg.content,
        userId: studentId,
        displayName,
        regionCode: body.regionCode,
      });
      latestRedacted = Array.from(new Set([...latestRedacted, ...res.redactedTypes]));
      latestPreview = res.sanitizedText.slice(0, 140);
      anonToken = res.anonToken;
      regulation = res.regulation;
      return {
        ...msg,
        content: res.sanitizedText,
      };
    });

    if (anonToken) {
      await db.insert(privacyAuditLogs).values({
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorAnonToken: anonToken,
        regionCode: body.regionCode,
        regulation,
        endpoint: "/api/tutor",
        redactedFieldsJson:
          latestRedacted.length > 0 ? latestRedacted : ["NO_RAW_PII_DETECTED"],
        payloadPreview: latestPreview || "[Empty prompt]",
      });
    }

    const response = await generateSocraticTutorReply({
      ...body,
      messages: sanitizedMessages,
    });

    return NextResponse.json({
      ok: true,
      ...response,
      privacyShield: {
        anonToken,
        regulation,
        redactedTypes: latestRedacted,
      },
    });
  } catch (error) {
    console.error("Socratic Tutor API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
