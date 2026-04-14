import { NextRequest, NextResponse } from "next/server";

const PROTECTED = /^\/collection(\/|$)/;
const AUTH_ONLY = /^\/auth\/(login|register)$/;

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hasSession   = !!request.cookies.get("session")?.value;

	if (PROTECTED.test(pathname) && !hasSession) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	if (AUTH_ONLY.test(pathname) && hasSession) {
		return NextResponse.redirect(new URL("/collection", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/collection/:path*", "/auth/login", "/auth/register"],
};
