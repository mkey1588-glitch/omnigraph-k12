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
import { authorizeStudentAccess } from "@/lib/auth/session";

function chunkReplyForStream(text: string): string[] {
  const tokens = text.match(/(\s+|\S+)/g) ?? [text];
  const chunks: string[] = [];
  let buf = "";
  for (const tk of tokens) {
    buf += tk;
    if (buf.length >= 16) {
      chunks.push(buf);
      buf = "";
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = (await req.json()) as SocraticTutorRequest & {
      studentId?: string;
      stream?: boolean;
    };

    const studentId = body.studentId || "stu_leo";
    const access = await authorizeStudentAccess(req, studentId);
    if (!access.allowed) {
      return NextResponse.json(
        { ok: false, error: access.reason ?? "Forbidden" },
        { status: 403 }
      );
    }

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

    const privacyShield = {
      anonToken,
      regulation,
      redactedTypes: latestRedacted,
    };

    if (body.stream) {
      const encoder = new TextEncoder();
      const chunks = chunkReplyForStream(response.reply);
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const sendEvent = (event: string, data: unknown) => {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          };

          sendEvent("meta", {
            provider: response.provider,
            groundedStandardCode: response.groundedStandardCode,
            referencedPrerequisites: response.referencedPrerequisites,
            stepDiagnosis: response.stepDiagnosis ?? null,
            privacyShield,
          });

          for (const part of chunks) {
            sendEvent("delta", { text: part });
            await new Promise((r) => setTimeout(r, 12));
          }

          sendEvent("done", { ok: true });
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      ...response,
      privacyShield,
    });
  } catch (error) {
    console.error("Socratic Tutor API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
