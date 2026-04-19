import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "relais_session";

export interface SessionPayload extends JWTPayload {
  therapistId: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload as JWTPayload)
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

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getTherapist() {
  const session = await getSession();
  if (!session) return null;
  return prisma.therapist.findUnique({
    where: { id: session.therapistId },
  });
}

export { COOKIE_NAME };
