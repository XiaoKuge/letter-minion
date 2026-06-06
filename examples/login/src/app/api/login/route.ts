import { NextRequest, NextResponse } from "next/server";
import {
  signToken,
  parseAccessCodes,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "服务器未配置 AUTH_SECRET" }, { status: 500 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    // empty / malformed body falls through to invalid
  }

  const codes = parseAccessCodes(process.env.ACCESS_CODES);
  const label = codes.get(password);
  if (!label) {
    return NextResponse.json({ error: "访问码无效" }, { status: 401 });
  }

  const now = Date.now();
  const token = await signToken(
    { label, iat: now, exp: now + SESSION_MAX_AGE_SECONDS * 1000 },
    secret
  );

  const res = NextResponse.json({ ok: true, label });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
