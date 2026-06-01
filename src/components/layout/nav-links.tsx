"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dashboard, Apple, Dumbbell, Scale, History, User } from "@/components/icons";
import { Avatar } from "@/components/ui";

const NAV = [
  { href: "/", label: "Dashboard", Icon: Dashboard },
  { href: "/log", label: "Food", Icon: Apple },
  { href: "/workout", label: "Workout", Icon: Dumbbell },
  { href: "/weight", label: "Weight", Icon: Scale },
  { href: "/history", label: "History", Icon: History },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/** Desktop center nav links with active highlighting. */
export function DesktopNavLinks() {
  const isActive = useActive();
  return (
    <nav className="hidden flex-1 items-center gap-1 md:flex">
      {NAV.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className="ct-navlink inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-sm font-semibold transition-all"
            style={{
              background: active ? "var(--primary-soft)" : "transparent",
              color: active ? "var(--primary-strong)" : "var(--muted)",
            }}
          >
            <Icon width={18} height={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop profile pill → settings. */
export function ProfilePill({ name }: { name: string }) {
  const isActive = useActive();
  const active = isActive("/settings");
  return (
    <Link
      href="/settings"
      className="ct-profile-btn flex items-center gap-2.5"
      style={{
        background: active ? "var(--primary-soft)" : "transparent",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "4px 12px 4px 4px",
        color: "var(--fg)",
      }}
    >
      <Avatar name={name} size={30} />
      <span className="hidden text-[13.5px] font-semibold md:inline">{name.split(" ")[0]}</span>
    </Link>
  );
}

/** Mobile bottom tab bar. */
export function BottomTabs() {
  const isActive = useActive();
  const tabs = [...NAV, { href: "/settings", label: "Profile", Icon: User }];
  return (
    <nav
      className="glass fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border px-1.5 md:hidden"
      style={{ height: "var(--tabbar-h)" }}
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 px-1.5 py-2"
            style={{ color: active ? "var(--primary)" : "var(--muted)", transition: "color .15s" }}
          >
            <span className="flex" style={{ transform: active ? "translateY(-1px)" : "none", transition: "transform .15s" }}>
              <Icon width={22} height={22} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 600 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
