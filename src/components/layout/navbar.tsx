import Link from "next/link";
import { auth } from "@/lib/auth";
import { BrandMark } from "@/components/ui";
import { DesktopNavLinks, ProfilePill, BottomTabs } from "./nav-links";

export async function Navbar() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <>
      {/* ── Top bar ─────────────────────────────── */}
      <header
        className="glass sticky top-0 z-40 flex items-center gap-4 border-b border-border px-5"
        style={{ height: "var(--navbar-h)" }}
      >
        <Link href="/" className="mr-2 flex items-center">
          <BrandMark />
        </Link>

        {session?.user ? (
          <>
            <DesktopNavLinks />
            <ProfilePill name={name} />
          </>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(120deg, var(--grad-a), var(--grad-b))", boxShadow: "var(--shadow-primary)" }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </header>

      {/* ── Mobile bottom tabs ──────────────────── */}
      {session?.user && <BottomTabs />}
    </>
  );
}
