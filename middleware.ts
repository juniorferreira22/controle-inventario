import { NextRequest, NextResponse } from "next/server";
import { sessionName, verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (await verifySession(request.cookies.get(sessionName)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!login|api/auth|_next|icon|manifest.webmanifest).*)"] };