"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Trade } from "@/types/trade";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function EquityCurve({ trades }: { trades: Trade[] }) {
  const closed = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);
  const sorted = [...closed].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let running = 0;
  const data = sorted.map((t, i) => {
    running += t.pnl ?? 0;
    return { index: i + 1, equity: Number(running.toFixed(2)) };
  });

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-grey">Equity Curve</h3>
      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-grey">
          Log your first trade to see your equity curve.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6D29" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF6D29" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis
              tick={{ fill: "#BABABA", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{
                background: "#161316",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#FF6D29"
              strokeWidth={2}
              fill="url(#equityFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
