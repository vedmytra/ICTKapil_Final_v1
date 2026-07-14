export interface MarketSession {
  id: string;
  name: string;
  city: string;
  /** UTC hour (0-23) the session opens/closes, on a standard (non-DST-adjusted) basis. */
  openUTC: number;
  closeUTC: number;
  color: string;
}

export const MARKET_SESSIONS: MarketSession[] = [
  { id: "sydney", name: "Sydney", city: "Sydney", openUTC: 21, closeUTC: 6, color: "#a855f7" },
  { id: "tokyo", name: "Tokyo", city: "Tokyo", openUTC: 0, closeUTC: 9, color: "#ec4899" },
  { id: "london", name: "London", city: "London", openUTC: 7, closeUTC: 16, color: "#3b82f6" },
  { id: "newyork", name: "New York", city: "New York", openUTC: 12, closeUTC: 21, color: "#16c784" },
];

/** ICT-style killzones, in UTC hour ranges (approximate, non-DST-adjusted). */
export const KILLZONES = [
  { id: "asian", name: "Asian Killzone", startUTC: 0, endUTC: 4 },
  { id: "london", name: "London Killzone", startUTC: 7, endUTC: 10 },
  { id: "ny-am", name: "New York AM Killzone", startUTC: 12, endUTC: 15 },
  { id: "ny-pm", name: "New York PM Killzone", startUTC: 18.5, endUTC: 20 },
  { id: "london-close", name: "London Close Killzone", startUTC: 14.5, endUTC: 16 },
];

function utcHourNow(now: Date): number {
  return now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
}

/** Handles sessions that wrap past midnight UTC (e.g. Sydney 21:00 -> 06:00). */
export function isSessionOpen(session: MarketSession, now: Date = new Date()): boolean {
  const hour = utcHourNow(now);
  if (session.openUTC < session.closeUTC) {
    return hour >= session.openUTC && hour < session.closeUTC;
  }
  // wraps midnight
  return hour >= session.openUTC || hour < session.closeUTC;
}

export interface SessionCountdown {
  isOpen: boolean;
  /** Seconds until the next state change (open->close or close->open). */
  secondsRemaining: number;
  label: string; // "Closes in" or "Opens in"
}

export function getSessionCountdown(
  session: MarketSession,
  now: Date = new Date()
): SessionCountdown {
  const open = isSessionOpen(session, now);
  const nowMs = now.getTime();

  const target = new Date(now);
  const targetHourUTC = open ? session.closeUTC : session.openUTC;
  const wholeHour = Math.floor(targetHourUTC);
  const minutes = Math.round((targetHourUTC - wholeHour) * 60);
  target.setUTCHours(wholeHour, minutes, 0, 0);

  if (target.getTime() <= nowMs) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const secondsRemaining = Math.max(0, Math.floor((target.getTime() - nowMs) / 1000));
  return {
    isOpen: open,
    secondsRemaining,
    label: open ? "Closes in" : "Opens in",
  };
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function isKillzoneActive(
  kz: { startUTC: number; endUTC: number },
  now: Date = new Date()
): boolean {
  const hour = utcHourNow(now);
  if (kz.startUTC < kz.endUTC) return hour >= kz.startUTC && hour < kz.endUTC;
  return hour >= kz.startUTC || hour < kz.endUTC;
}
