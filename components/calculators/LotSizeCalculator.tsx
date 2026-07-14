import { useState } from "react";
import InstrumentSelect from "@/components/InstrumentSelect";
import { calculateLotSize } from "@/lib/calculators";

export default function LotSizeCalculator() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLossPips, setStopLossPips] = useState(20);

  const result = calculateLotSize({ symbol, accountBalance, riskPercent, stopLossPips });

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
          <label className="block text-sm text-slate-400 mb-1">Risk (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stop Loss (pips)</label>
          <input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-surface-light border border-surface-border rounded-lg p-5 space-y-4 h-fit">
        <h3 className="text-sm text-slate-400">Result</h3>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-sm">Recommended Lot Size</span>
          <span className="text-2xl font-semibold text-profit">{result.lotSize}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Risk Amount</span>
          <span>${result.riskAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Pip Value at this size</span>
          <span>${result.pipValue.toFixed(2)}</span>
        </div>
        <p className="text-xs text-slate-500 pt-2 border-t border-surface-border">
          Assumes account currency matches the quote currency (USD). Cross-currency
          pairs may need an extra conversion step with your broker's actual pip value.
        </p>
      </div>
    </div>
  );
}
