import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
  therapistId: string;
  email: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
export const COOKIE_NAME = "relais_session";

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
