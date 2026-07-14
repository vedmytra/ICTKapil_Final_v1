"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Calculator,
  CalendarClock,
  NotebookPen,
  Settings,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Trade Journal", icon: BookOpen },
  { href: "/backtesting", label: "Backtesting", icon: FlaskConical },
  { href: "/calculator", label: "Lot Calculator", icon: Calculator },
  { href: "/calendar", label: "News Calendar", icon: CalendarClock },
  { href: "/notes", label: "Strategy Library", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut, user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/8 bg-bg-1/60 p-4 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#ff9d5c] font-mono text-sm font-bold text-bg-1">
          IK
        </div>
        <span className="text-lg font-extrabold tracking-tight">
          Ict<span className="text-accent">Kapil</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-grey hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/8 pt-4">
        <div className="mb-2 px-2 text-xs text-grey truncate">{user?.email}</div>
        <button
          onClick={logOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-grey transition-colors hover:bg-loss/10 hover:text-loss"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
