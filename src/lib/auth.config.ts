// ─── NextAuth Configuration (edge-compatible) ───
// This file contains the auth config WITHOUT database imports,
// so it can be safely used in Edge Middleware.

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Credentials provider is declared here for awareness,
    // but the actual `authorize` logic is in auth.ts (Node.js runtime only).
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't require auth
      const publicRoutes = ["/login", "/register"];
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isPublicRoute) {
        // Redirect logged-in users away from auth pages to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      // Onboarding is protected (requires login) but logged-in users
      // should NOT be redirected away from it.
      if (pathname.startsWith("/onboarding")) {
        return isLoggedIn;
      }

      // All other routes require auth
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
