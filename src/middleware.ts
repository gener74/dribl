import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("dribl_auth")?.value;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiLogin = req.nextUrl.pathname === "/api/login";

  if (isLoginPage || isApiLogin) return NextResponse.next();

  if (auth !== process.env.AUTH_TOKEN) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icons|manifest.json|sw.js).*)"],
};
