import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getEnv } from "@/lib/config/env";
import { consumeRateLimit } from "@/lib/security/rateLimiter";

const applySecurityHeaders = (response: NextResponse, csp: string) => {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
};

const applyCorsHeaders = (response: NextResponse, origin: string) => {
  response.headers.set("Access-Control-Allow-Origin", origin === "*" ? "*" : origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
};

export function middleware(request: NextRequest) {
  const env = getEnv();
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const origin = env.CORS_ORIGIN ?? "*";
  const csp =
    env.CONTENT_SECURITY_POLICY ??
    "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https://us.posthog.com; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';";

  if (isApiRoute && request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, origin);
    applySecurityHeaders(response, csp);
    return response;
  }

  if (isApiRoute) {
    const limit = env.RATE_LIMIT_MAX ?? 120;
    const windowMs = env.RATE_LIMIT_WINDOW_MS ?? 60_000;
    const identifier =
      request.ip ??
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const result = consumeRateLimit(identifier, limit, windowMs);

    if (!result.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      });
    }
  }

  const response = NextResponse.next();

  if (isApiRoute) {
    applyCorsHeaders(response, origin);
  }

  applySecurityHeaders(response, csp);

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
