// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/; // Regex for files with extensions

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static files and internal paths
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 2. Handle auth redirects
  const token = request.cookies.get("token")?.value;
  const authRoutes = ["/sign-in", "/sign-up"];

  if (!token && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
