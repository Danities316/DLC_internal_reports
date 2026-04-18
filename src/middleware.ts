import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const publicPaths = ["/auth"];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
