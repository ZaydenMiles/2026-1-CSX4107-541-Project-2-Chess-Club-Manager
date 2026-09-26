import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session.js";

export const PUBLIC_PAGES = ["/login", "/register"];

/*
 * Redirects visitors without a signed session cookie to the login page.
 * This only checks the cookie signature. Whether the player still exists is
 * checked against the database in the root layout, which also sends signed-in
 * players away from the login and register pages.
 * API routes do their own checks (including roles) and are excluded here.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !PUBLIC_PAGES.includes(pathname)) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Pass the path to the root layout so it can redirect based on the real session.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico)$).*)"],
};
