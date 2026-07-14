import { useEffect, useState } from "react";
import { EconomicEvent, fetchEconomicEvents, CURRENCIES, IMPACT_COLORS, NewsImpact } from "@/lib/newsCalendar";
import { formatInTimezone, detectUserTimezone, COMMON_TIMEZONES } from "@/lib/timezone";
import clsx from "clsx";

export default function NewsCalendarTable() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencyFilter, setCurrencyFilter] = useState<string>("");
  const [impactFilter, setImpactFilter] = useState<NewsImpact | "">("");
  const [timezone, setTimezone] = useState(detectUserTimezone());

  useEffect(() => {
    fetchEconomicEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const filtered = events
    .filter((e) => !currencyFilter || e.country === currencyFilter)
    .filter((e) => !impactFilter || e.impact === impactFilter)
    .sort((a, b) => new Date(a.dateTimeUTC).getTime() - new Date(b.dateTimeUTC).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="px-2 py-2 bg-surface-light border border-surface-border rounded-md text-sm"
        >
          <option value="">All currencies</option>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={impactFilter}
          onChange={(e) => setImpactFilter(e.target.value as NewsImpact | "")}
          className="px-2 py-2 bg-surface-light border border-surface-border rounded-md text-sm"
        >
          <option value="">All impact</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="holiday">Holiday</option>
        </select>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="px-2 py-2 bg-surface-light border border-surface-border rounded-md text-sm ml-auto"
        >
          {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-xs text-amber-300">
        Showing sample event data for layout/testing. Wire <code>fetchEconomicEvents()</code> in{" "}
        <code>src/lib/newsCalendar.ts</code> to a real economic-calendar provider (via your backend) for live data.
      </div>

      <div className="overflow-x-auto border border-surface-border rounded-lg">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-surface-light text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Forecast</th>
              <th className="px-4 py-3">Previous</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading events...</td></tr>
            )}
            {!loading && filtered.map((e) => (
              <tr key={e.id} className="border-t border-surface-border">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {formatInTimezone(e.dateTimeUTC, timezone)}
                </td>
                <td className="px-4 py-3 font-medium">{e.country}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor: `${IMPACT_COLORS[e.impact]}22`,
                      color: IMPACT_COLORS[e.impact],
                    }}
                  >
                    {e.impact}
                  </span>
                </td>
                <td className="px-4 py-3">{e.title}</td>
                <td className="px-4 py-3 text-slate-400">{e.forecast ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">{e.previous ?? "—"}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No events match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
