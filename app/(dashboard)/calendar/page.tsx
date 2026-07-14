"use client";

import { useState } from "react";
import NewsCalendarTable from "@/components/NewsCalendarTable";
import SessionClock from "@/components/SessionClock";
import clsx from "clsx";

const TABS = [
  { id: "news", label: "News Calendar" },
  { id: "sessions", label: "Session Clock" },
] as const;

export default function CalendarPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("news");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">News Calendar</h1>

      <div className="flex gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium",
              active === t.id ? "bg-accent text-bg-1" : "text-grey hover:bg-white/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "news" ? <NewsCalendarTable /> : <SessionClock />}
    </div>
  );
}
