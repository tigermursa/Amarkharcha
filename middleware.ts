// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // প্রোটেক্টেড রুটের তালিকা
  const protectedPaths = ["/", "/dashboard", "/expenses", "/categories"];
  const isProtected = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path + "/"),
  );

  // লগইন না করলে লগইন পেজে রিডাইরেক্ট
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // অলরেডি লগইন করা থাকলে লগইন/রেজিস্টার পেজ থেকে ড্যাশবোর্ডে রিডাইরেক্ট
  if (
    sessionCookie &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * ম্যাচ করুন:
     * - / (হোম)
     * - /dashboard, /expenses, /categories
     * - /login, /register বাদ দিয়ে
     * - /api, /_next, /static বাদ দিয়ে
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
