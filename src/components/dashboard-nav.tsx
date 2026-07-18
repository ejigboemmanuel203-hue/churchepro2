"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ic = "h-5 w-5";
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" className={ic}>
      <path d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  attendance: (
    <svg viewBox="0 0 24 24" fill="none" className={ic}>
      <path d="M7 3v3M17 3v3M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  followup: (
    <svg viewBox="0 0 24 24" fill="none" className={ic}>
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 5.3a3 3 0 0 1 0 5.8M21 19c0-2.2-1.2-4-3-4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sermons: (
    <svg viewBox="0 0 24 24" fill="none" className={ic}>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  prayer: (
    <svg viewBox="0 0 24 24" fill="none" className={ic}>
      <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: ICONS.home },
  { href: "/dashboard/attendance", label: "Attendance", icon: ICONS.attendance },
  { href: "/dashboard/followup", label: "Follow-up", icon: ICONS.followup },
  { href: "/dashboard/sermons", label: "Sermons", icon: ICONS.sermons },
  { href: "/dashboard/prayer", label: "Prayer", icon: ICONS.prayer },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-steel/15 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-56 md:flex-col">
        <Link href="/dashboard" className="border-b border-steel/15 px-5 py-4 font-bold text-navy">
          Church<span className="text-sky">epro</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {ITEMS.map((it) => {
            const active = isActive(it.href, pathname);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-ice text-deep" : "text-steel hover:bg-ice/60 hover:text-navy"
                }`}
              >
                {it.icon}
                {it.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-steel/15 bg-white md:hidden">
        {ITEMS.map((it) => {
          const active = isActive(it.href, pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-sky" : "text-steel"
              }`}
            >
              {it.icon}
              {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
