import { useEffect, useState } from "react";
import { MARKET_SESSIONS, KILLZONES, isSessionOpen, getSessionCountdown, formatCountdown, isKillzoneActive } from "@/lib/sessions";
import { COMMON_TIMEZONES, formatInTimezone, detectUserTimezone } from "@/lib/timezone";
import clsx from "clsx";

export default function SessionClock() {
  const [now, setNow] = useState(new Date());
  const [timezone, setTimezone] = useState(detectUserTimezone());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          Local time ({timezone}): <span className="text-slate-200 font-medium">{formatInTimezone(now.toISOString(), timezone)}</span>
        </div>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="px-3 py-2 bg-surface-light border border-surface-border rounded-md text-sm"
        >
          {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MARKET_SESSIONS.map((session) => {
          const open = isSessionOpen(session, now);
          const countdown = getSessionCountdown(session, now);
          return (
            <div
              key={session.id}
              className={clsx(
                "border rounded-lg p-4 space-y-2",
                open ? "bg-profit/10 border-profit/30" : "bg-surface-light border-surface-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{session.name}</span>
                <span
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    open ? "bg-profit/20 text-profit" : "bg-slate-500/20 text-slate-400"
                  )}
                >
                  {open ? "OPEN" : "CLOSED"}
                </span>
              </div>
              <div className="text-xs text-slate-400">{countdown.label}</div>
              <div className="text-xl font-mono font-semibold">
                {formatCountdown(countdown.secondsRemaining)}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-sm text-slate-400 mb-3">ICT Killzones (UTC)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KILLZONES.map((kz) => {
            const active = isKillzoneActive(kz, now);
            return (
              <div
                key={kz.id}
                className={clsx(
                  "border rounded-lg p-3 flex items-center justify-between text-sm",
                  active ? "bg-profit/10 border-profit/30" : "bg-surface-light border-surface-border"
                )}
              >
                <span>{kz.name}</span>
                <span className={clsx("text-xs", active ? "text-profit" : "text-slate-500")}>
                  {String(Math.floor(kz.startUTC)).padStart(2, "0")}:{String((kz.startUTC % 1) * 60).padStart(2, "0")}–
                  {String(Math.floor(kz.endUTC)).padStart(2, "0")}:{String((kz.endUTC % 1) * 60).padStart(2, "0")} UTC
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
