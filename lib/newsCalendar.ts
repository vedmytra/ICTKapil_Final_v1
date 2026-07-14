export type NewsImpact = "high" | "medium" | "low" | "holiday";

export interface EconomicEvent {
  id: string;
  title: string;
  country: string; // ISO-ish currency/country code, e.g. "USD", "EUR", "GBP"
  impact: NewsImpact;
  dateTimeUTC: string; // ISO
  forecast?: string;
  previous?: string;
  actual?: string;
}

/**
 * Illustrative sample data so the calendar UI is fully functional out of the box.
 * In production, replace `fetchEconomicEvents` below with a call to a real
 * economic-calendar provider (e.g. Forex Factory's unofficial JSON feed,
 * Trading Economics API, or FMP's economic calendar endpoint) via your own
 * backend proxy — never call third-party finance APIs directly from the
 * client with an exposed key.
 */
function sampleEventsForWeek(): EconomicEvent[] {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const mk = (dayOffset: number, hour: number, minute: number): string => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + dayOffset);
    d.setUTCHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    { id: "1", title: "Non-Farm Payrolls", country: "USD", impact: "high", dateTimeUTC: mk(1, 12, 30), forecast: "180K", previous: "175K" },
    { id: "2", title: "Unemployment Rate", country: "USD", impact: "high", dateTimeUTC: mk(1, 12, 30), forecast: "4.1%", previous: "4.0%" },
    { id: "3", title: "ECB Interest Rate Decision", country: "EUR", impact: "high", dateTimeUTC: mk(2, 12, 15), forecast: "3.75%", previous: "3.75%" },
    { id: "4", title: "CPI y/y", country: "GBP", impact: "high", dateTimeUTC: mk(0, 6, 0), forecast: "2.3%", previous: "2.2%" },
    { id: "5", title: "Retail Sales m/m", country: "USD", impact: "medium", dateTimeUTC: mk(3, 12, 30), forecast: "0.3%", previous: "0.1%" },
    { id: "6", title: "BOJ Policy Statement", country: "JPY", impact: "high", dateTimeUTC: mk(2, 3, 0), forecast: "—", previous: "—" },
    { id: "7", title: "Crude Oil Inventories", country: "USD", impact: "medium", dateTimeUTC: mk(2, 15, 30), forecast: "-1.2M", previous: "0.8M" },
    { id: "8", title: "PMI Manufacturing", country: "EUR", impact: "medium", dateTimeUTC: mk(0, 8, 0), forecast: "48.5", previous: "48.1" },
    { id: "9", title: "Bank Holiday", country: "GBP", impact: "holiday", dateTimeUTC: mk(4, 0, 0) },
    { id: "10", title: "FOMC Meeting Minutes", country: "USD", impact: "high", dateTimeUTC: mk(3, 18, 0), forecast: "—", previous: "—" },
  ];
}

/**
 * Fetch layer — swap the body of this function for a real API call
 * (through your backend, e.g. `fetch('/api/economic-calendar')`).
 * Signature is kept async so the swap requires no changes upstream.
 */
export async function fetchEconomicEvents(): Promise<EconomicEvent[]> {
  return Promise.resolve(sampleEventsForWeek());
}

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

export const IMPACT_COLORS: Record<NewsImpact, string> = {
  high: "#ea3943",
  medium: "#f59e0b",
  low: "#64748b",
  holiday: "#3b82f6",
};
