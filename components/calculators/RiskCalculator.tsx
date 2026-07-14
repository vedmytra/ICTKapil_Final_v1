import { useState } from "react";
import InstrumentSelect from "@/components/InstrumentSelect";
import { calculateRisk } from "@/lib/calculators";
import clsx from "clsx";

export default function RiskCalculator() {
  const [symbol, setSymbol] = useState("BTCUSD");
  const [accountBalance, setAccountBalance] = useState(10000);
  const [entryPrice, setEntryPrice] = useState(65000);
  const [stopLossPrice, setStopLossPrice] = useState(64000);
  const [takeProfitPrice, setTakeProfitPrice] = useState(68000);
  const [lotSize, setLotSize] = useState(0.1);

  const result = calculateRisk({
    symbol, accountBalance, entryPrice, stopLossPrice, takeProfitPrice, lotSize,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Instrument</label>
          <InstrumentSelect value={symbol} onChange={setSymbol} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Account Balance ($)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Lot Size</label>
          <input
            type="number"
            step="0.01"
            value={lotSize}
            onChange={(e) => setLotSize(Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Entry</label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Stop Loss</label>
            <input
              type="number"
              step="any"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(Number(e.target.value))}
              className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Take Profit</label>
            <input
              type="number"
              step="any"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
              className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-light border border-surface-border rounded-lg p-5 space-y-4 h-fit">
        <h3 className="text-sm text-slate-400">Result</h3>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-sm">Risk / Reward Ratio</span>
          <span className="text-2xl font-semibold text-profit">
            {result.riskRewardRatio !== null ? `1 : ${result.riskRewardRatio}` : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Risk Amount</span>
          <span className="text-loss">${result.riskAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Risk % of Account</span>
          <span className={clsx(result.riskPercent > 2 ? "text-loss" : "text-slate-200")}>
            {result.riskPercent.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Potential Reward</span>
          <span className="text-profit">${result.rewardAmount.toFixed(2)}</span>
        </div>
        {result.riskPercent > 2 && (
          <p className="text-xs text-loss pt-2 border-t border-surface-border">
            This risks more than 2% of the account on a single trade.
          </p>
        )}
      </div>
    </div>
  );
}
