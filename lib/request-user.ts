import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { sessionName } from "@/lib/auth";

export async function requestUserEmail() {
  const token = (await cookies()).get(sessionName)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}