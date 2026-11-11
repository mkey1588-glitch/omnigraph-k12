import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  classMemberships,
  classrooms,
  parentChildLinks,
} from "@/db/schema";
import type { RegionCode, UserRole } from "@/types/taxonomy";

export const SESSION_COOKIE_NAME = "omni_session";

export const DEMO_SEED_USER_IDS = [
  "stu_leo",
  "stu_mia",
  "stu_chloe",
  "stu_mei",
  "stu_kenta",
  "stu_minjun",
  "stu_aryan",
  "tch_wang",
  "par_lin",
] as const;

const DEMO_USER_SET = new Set<string>(DEMO_SEED_USER_IDS);

export function isDemoUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return DEMO_USER_SET.has(userId);
}

function getAuthSecret(): string {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  return "omnigraph-k12-v1-hmac-session-secret-key-2026";
}

const SCRYPT_PREFIX = "scrypt$";
const PIN_SCRYPT_PREFIX = "pin_scrypt$";
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export function isHashedSecret(stored: string | null | undefined): boolean {
  return Boolean(stored && stored.startsWith(SCRYPT_PREFIX));
}

export function isHashedKidPin(stored: string | null | undefined): boolean {
  return Boolean(stored && stored.startsWith(PIN_SCRYPT_PREFIX));
}

/**
 * Hash a user password / secretCode using Node native `scrypt` + random 16-byte salt.
 * Output format: `scrypt$<saltHex>$<derivedKeyHex>`
 */
export function hashSecret(plain: string, fixedSaltHex?: string): string {
  const normalized = plain.trim();
  const saltHex = fixedSaltHex ?? randomBytes(16).toString("hex");
  const derived = scryptSync(
    normalized,
    Buffer.from(saltHex, "hex"),
    32,
    SCRYPT_PARAMS
  );
  return `${SCRYPT_PREFIX}${saltHex}$${derived.toString("hex")}`;
}

/**
 * Constant-time verification of a user password / secretCode against a stored `scrypt` hash.
 * Transparently supports legacy plaintext values prior to automatic DB hash migration.
 */
export function verifySecret(plain: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const normalized = plain.trim();
  if (!stored.startsWith(SCRYPT_PREFIX)) {
    const a = Buffer.from(normalized, "utf8");
    const b = Buffer.from(stored, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const parts = stored.slice(SCRYPT_PREFIX.length).split("$");
  if (parts.length !== 2) return false;
  const [saltHex, expectedHex] = parts;
  try {
    const candidate = scryptSync(
      normalized,
      Buffer.from(saltHex, "hex"),
      32,
      SCRYPT_PARAMS
    );
    const expected = Buffer.from(expectedHex, "hex");
    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    );
  } catch {
    return false;
  }
}

/**
 * Deterministic domain-peppered `scrypt` hash for 6-digit Family Kid PINs.
 * Keeps raw PINs out of the database while preserving O(1) indexed lookup on `kid_pin`.
 */
export function hashKidPin(pin: string): string {
  const normalized = pin.trim();
  const pepperSalt = createHmac("sha256", getAuthSecret())
    .update("omnigraph:kid-pin-domain-salt:v1")
    .digest()
    .subarray(0, 16);
  const derived = scryptSync(normalized, pepperSalt, 24, SCRYPT_PARAMS);
  return `${PIN_SCRYPT_PREFIX}${derived.toString("hex")}`;
}

export function verifyKidPin(
  pin: string,
  stored: string | null | undefined
): boolean {
  if (!stored) return false;
  const normalized = pin.trim();
  if (!stored.startsWith(PIN_SCRYPT_PREFIX)) {
    const a = Buffer.from(normalized, "utf8");
    const b = Buffer.from(stored, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const candidate = Buffer.from(hashKidPin(normalized), "utf8");
  const expected = Buffer.from(stored, "utf8");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

export interface SessionPayload {
  uid: string;
  role: UserRole;
  reg: RegionCode;
  demo: boolean;
  exp: number; // Unix timestamp in seconds
}

function toBase64Url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(b64url: string): Buffer {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64");
}

export function signSessionToken(
  payload: Omit<SessionPayload, "exp">,
  ttlSeconds = 7 * 24 * 3600
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const bodySegment = toBase64Url(JSON.stringify(fullPayload));
  const sig = createHmac("sha256", getAuthSecret())
    .update(bodySegment)
    .digest();
  return `${bodySegment}.${toBase64Url(sig)}`;
}

export function verifySessionToken(
  token: string | null | undefined
): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx !== token.lastIndexOf(".")) return null;

  const bodySegment = token.slice(0, dotIdx);
  const sigSegment = token.slice(dotIdx + 1);

  try {
    const expectedSig = createHmac("sha256", getAuthSecret())
      .update(bodySegment)
      .digest();
    const providedSig = fromBase64Url(sigSegment);
    if (
      expectedSig.length !== providedSig.length ||
      !timingSafeEqual(expectedSig, providedSig)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      fromBase64Url(bodySegment).toString("utf8")
    ) as Partial<SessionPayload>;

    if (
      !parsed ||
      typeof parsed.uid !== "string" ||
      !parsed.role ||
      !parsed.reg ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      uid: parsed.uid,
      role: parsed.role,
      reg: parsed.reg,
      demo: Boolean(parsed.demo),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function parseSessionFromRequest(req: Request): SessionPayload | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";");
  for (const part of pairs) {
    const eqIdx = part.indexOf("=");
    if (eqIdx <= 0) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key === SESSION_COOKIE_NAME) {
      const rawVal = decodeURIComponent(part.slice(eqIdx + 1).trim());
      return verifySessionToken(rawVal);
    }
  }
  return null;
}

export function attachSessionCookie(
  res: NextResponse,
  payload: Omit<SessionPayload, "exp">,
  ttlSeconds = 7 * 24 * 3600
): string {
  const token = signSessionToken(payload, ttlSeconds);
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlSeconds,
  });
  return token;
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export interface AccessDecision {
  allowed: boolean;
  actorId: string;
  actorRole: UserRole;
  isDemo: boolean;
  reason?: string;
}

/**
 * RBAC check for reading/writing a student's learning records:
 * - Built-in sandbox demo personas (`stu_leo`, `stu_mia`, etc.) are accessible in sandbox mode
 *   unless a real non-demo student session attempts to cross-write another non-demo student.
 * - Real registered student accounts strictly require an authenticated session belonging to:
 *   (a) the student themselves, (b) a linked parent in `parent_child_links`, or (c) the student's classroom teacher.
 */
export async function authorizeStudentAccess(
  req: Request,
  targetStudentId: string
): Promise<AccessDecision> {
  const session = parseSessionFromRequest(req);

  if (isDemoUserId(targetStudentId)) {
    return {
      allowed: true,
      actorId: session?.uid ?? targetStudentId,
      actorRole: session?.role ?? "student",
      isDemo: true,
    };
  }

  if (!session) {
    return {
      allowed: false,
      actorId: "anonymous",
      actorRole: "student",
      isDemo: false,
      reason: "Authentication required to access registered student records.",
    };
  }

  if (session.uid === targetStudentId) {
    return {
      allowed: true,
      actorId: session.uid,
      actorRole: session.role,
      isDemo: session.demo,
    };
  }

  if (session.role === "parent") {
    const links = await db
      .select()
      .from(parentChildLinks)
      .where(
        and(
          eq(parentChildLinks.parentId, session.uid),
          eq(parentChildLinks.studentId, targetStudentId)
        )
      );
    if (links.length > 0) {
      return {
        allowed: true,
        actorId: session.uid,
        actorRole: "parent",
        isDemo: session.demo,
      };
    }
  }

  if (session.role === "teacher") {
    const teacherClasses = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .where(eq(classrooms.teacherId, session.uid));
    const classIds = teacherClasses.map((c) => c.id);
    if (classIds.length > 0) {
      const memberRows = await db
        .select()
        .from(classMemberships)
        .where(
          and(
            inArray(classMemberships.classId, classIds),
            eq(classMemberships.studentId, targetStudentId)
          )
        );
      if (memberRows.length > 0) {
        return {
          allowed: true,
          actorId: session.uid,
          actorRole: "teacher",
          isDemo: session.demo,
        };
      }
    }
  }

  return {
    allowed: false,
    actorId: session.uid,
    actorRole: session.role,
    isDemo: session.demo,
    reason: "Forbidden: horizontal access to another student's records is blocked.",
  };
}

export function authorizeParentMutation(
  req: Request,
  targetParentId: string
): AccessDecision {
  const session = parseSessionFromRequest(req);
  if (isDemoUserId(targetParentId)) {
    return {
      allowed: true,
      actorId: session?.uid ?? targetParentId,
      actorRole: session?.role ?? "parent",
      isDemo: true,
    };
  }
  if (!session || session.uid !== targetParentId || session.role !== "parent") {
    return {
      allowed: false,
      actorId: session?.uid ?? "anonymous",
      actorRole: session?.role ?? "student",
      isDemo: false,
      reason: "Forbidden: valid parent session required.",
    };
  }
  return {
    allowed: true,
    actorId: session.uid,
    actorRole: "parent",
    isDemo: session.demo,
  };
}

export function authorizeEducatorMutation(
  req: Request,
  claimedTeacherId?: string
): AccessDecision {
  const session = parseSessionFromRequest(req);
  // Block real non-demo students/parents from calling teacher studio / assignment creation endpoints
  if (session && !session.demo && session.role !== "teacher") {
    return {
      allowed: false,
      actorId: session.uid,
      actorRole: session.role,
      isDemo: false,
      reason: "Forbidden: teacher role required for educator studio mutations.",
    };
  }
  if (claimedTeacherId && !isDemoUserId(claimedTeacherId)) {
    if (!session || session.uid !== claimedTeacherId || session.role !== "teacher") {
      return {
        allowed: false,
        actorId: session?.uid ?? "anonymous",
        actorRole: session?.role ?? "student",
        isDemo: false,
        reason: "Forbidden: authenticated teacher session does not match teacherId.",
      };
    }
  }
  return {
    allowed: true,
    actorId: session?.uid ?? claimedTeacherId ?? "tch_wang",
    actorRole: "teacher",
    isDemo: session ? session.demo : true,
  };
}
