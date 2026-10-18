import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/report-analyzer", "/diet-planner", "/exercise-planner", "/chatbot", "/doctors"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("hs_session")?.value;
  const adminSession = request.cookies.get("hs_admin")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAdmin && adminSession !== "true") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isAuth && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
