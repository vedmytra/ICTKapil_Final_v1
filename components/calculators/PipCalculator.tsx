import { useState } from "react";
import InstrumentSelect from "@/components/InstrumentSelect";
import { calculatePipValue, getInstrument } from "@/lib/calculators";

export default function PipCalculator() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lotSize, setLotSize] = useState(1);

  const instrument = getInstrument(symbol);
  const pipValue = calculatePipValue({ symbol, lotSize });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Instrument</label>
          <InstrumentSelect value={symbol} onChange={setSymbol} />
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
      </div>

      <div className="bg-surface-light border border-surface-border rounded-lg p-5 space-y-4 h-fit">
        <h3 className="text-sm text-slate-400">Result</h3>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-sm">Value per Pip</span>
          <span className="text-2xl font-semibold text-profit">${pipValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Contract Size</span>
          <span>{instrument.contractSize.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Pip Size</span>
          <span>{instrument.pipSize}</span>
        </div>
      </div>
    </div>
  );
}
