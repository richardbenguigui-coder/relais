import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/signup", "/patient"];
const ONBOARDING_PATH = "/onboarding";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("relais_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("relais_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
};
