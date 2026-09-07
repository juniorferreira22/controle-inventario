import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const sessionName = "casa300_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET nao foi definido.");
  return encoder.encode(value);
}

export async function createSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token?: string) {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export { sessionName };