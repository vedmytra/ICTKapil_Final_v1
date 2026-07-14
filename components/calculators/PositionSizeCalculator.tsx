import { useState } from "react";
import InstrumentSelect from "@/components/InstrumentSelect";
import { calculatePositionSize, getInstrument } from "@/lib/calculators";

export default function PositionSizeCalculator() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(2400);
  const [stopLossPrice, setStopLossPrice] = useState(2390);

  const instrument = getInstrument(symbol);
  const result = calculatePositionSize({
    symbol, accountBalance, riskPercent, entryPrice, stopLossPrice,
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
          <label className="block text-sm text-slate-400 mb-1">Risk (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Entry Price</label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Stop Loss Price</label>
            <input
              type="number"
              step="any"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(Number(e.target.value))}
              className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-light border border-surface-border rounded-lg p-5 space-y-4 h-fit">
        <h3 className="text-sm text-slate-400">Result</h3>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-sm">Position Size (lots)</span>
          <span className="text-2xl font-semibold text-profit">{result.lots}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Units / {instrument.assetClass === "crypto" ? "coins" : "contract units"}</span>
          <span>{result.units.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Risk Amount</span>
          <span>${result.riskAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Stop Distance</span>
          <span>{result.stopDistance}</span>
        </div>
      </div>
    </div>
  );
}
