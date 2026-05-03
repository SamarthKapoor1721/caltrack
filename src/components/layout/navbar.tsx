import Link from "next/link";
import { Flame, Apple, Scale, TrendingUp, Target } from "@/components/icons";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export async function Navbar() {
  const session = await auth();

  return (
    <>
      {/* ── Desktop top bar ─────────────────────── */}
      <nav className="sticky top-0 z-50 hidden h-16 border-b border-border-light bg-card/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Cal<span className="text-primary">Track</span>
            </span>
          </Link>

          {/* Navigation Links + Auth */}
          {session?.user ? (
            <div className="flex items-center gap-1">
              <NavLink href="/" label="Dashboard" />
              <NavLink href="/log" label="Log Food" />
              <NavLink href="/workout" label="Workout" />
              <NavLink href="/weight" label="Weight" />
              <NavLink href="/history" label="History" />
              <NavLink href="/settings" label="Settings" />

              <div className="ml-3 flex items-center gap-3 border-l border-border pl-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
                </div>
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile top bar (brand only) ─────────── */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border-light bg-card/80 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Cal<span className="text-primary">Track</span>
          </span>
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <SignOutButton />
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-primary">
            Sign In
          </Link>
        )}
      </nav>

      {/* ── Mobile bottom nav ───────────────────── */}
      {session?.user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-light bg-card/90 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex h-[var(--mobile-nav-height)] max-w-lg items-center justify-around px-2">
            <MobileNavLink href="/" icon={<Flame className="h-5 w-5" />} label="Home" />
            <MobileNavLink href="/log" icon={<Apple className="h-5 w-5" />} label="Log" />
            <MobileNavLink href="/workout" icon={<Flame className="h-5 w-5" />} label="Workout" />
            <MobileNavLink href="/weight" icon={<Scale className="h-5 w-5" />} label="Weight" />
            <MobileNavLink href="/history" icon={<TrendingUp className="h-5 w-5" />} label="History" />
            <MobileNavLink href="/settings" icon={<Target className="h-5 w-5" />} label="Settings" />
          </div>
        </nav>
      )}
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3.5 py-2 text-sm font-medium text-muted transition-all hover:bg-primary/8 hover:text-foreground"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-1.5 text-muted transition-colors hover:text-primary"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
