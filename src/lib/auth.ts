import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifySession, COOKIE_NAME } from "./session";

export type { SessionPayload } from "./session";
export { createSession, verifySession, COOKIE_NAME } from "./session";

export async function getSession() {
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
