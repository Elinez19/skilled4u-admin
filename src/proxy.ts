import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
]);

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/api/v1");

  if (isApiRoute) {
    const allowOrigin =
      ALLOWED_ORIGINS.has(origin) || origin.startsWith("exp://")
        ? origin
        : "*";

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, Accept",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Expose-Headers": "set-auth-token",
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    response.headers.set("Access-Control-Expose-Headers", "set-auth-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*", "/api/v1/:path*"],
};

