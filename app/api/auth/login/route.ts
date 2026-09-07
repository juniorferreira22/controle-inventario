import { NextResponse } from "next/server";
import { createSession, sessionName } from "@/lib/auth";

export async function POST(request: Request) {
  const wantsJson = request.headers.get("content-type")?.includes("application/json") || request.headers.get("accept")?.includes("application/json");
  const payload = request.headers.get("content-type")?.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (email !== process.env.INTERNAL_LOGIN_EMAIL?.toLowerCase() || password !== process.env.INTERNAL_LOGIN_PASSWORD) {
    if (wantsJson) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  const response = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(sessionName, await createSession(email), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}