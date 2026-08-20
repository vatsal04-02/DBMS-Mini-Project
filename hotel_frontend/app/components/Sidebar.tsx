"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", mark: "DH" },
  { href: "/rooms", label: "Rooms", mark: "RM" },
  { href: "/bookings", label: "Bookings", mark: "BK" },
  { href: "/guests", label: "Guests", mark: "GT" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col bg-[linear-gradient(180deg,#0c2a2c_0%,#123638_55%,#0f3032_100%)] text-white">
      <div className="border-b border-white/10 px-6 py-7">
        <p className="font-display text-2xl font-semibold tracking-tight text-[#f3ebe2]">
          Grand Horizon
        </p>
        <p className="mt-1 text-xs font-medium tracking-[0.16em] text-white/45 uppercase">
          Hotel Operations
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${active ? "active" : ""}`}
            >
              <span className="nav-icon">{link.mark}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-xs text-white/40">Front desk console</p>
        <p className="mt-1 text-xs text-[#c9a06e]">v1.0 · Live</p>
      </div>
    </aside>
  );
}
