// ─── Route Protection Middleware ───
// Uses the edge-compatible auth.config.ts (no Prisma / Node.js imports).
// The `authorized` callback controls access:
//   - Unauthenticated users → redirected to /login
//   - Logged-in users on /login or /register → redirected to /

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - api/register (registration endpoint)
     * - api/onboarding (onboarding endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!api/auth|api/register|api/onboarding|_next/static|_next/image|favicon.ico).*)",
  ],
};
