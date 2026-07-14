import { INSTRUMENTS, AssetClass } from "@/lib/calculators";

const CLASS_LABELS: Record<AssetClass, string> = {
  forex: "Forex",
  gold: "Gold",
  silver: "Silver",
  crypto: "Crypto",
};

export default function InstrumentSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (symbol: string) => void;
}) {
  const groups: AssetClass[] = ["forex", "gold", "silver", "crypto"];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
    >
      {groups.map((group) => (
        <optgroup key={group} label={CLASS_LABELS[group]}>
          {INSTRUMENTS.filter((i) => i.assetClass === group).map((i) => (
            <option key={i.symbol} value={i.symbol}>{i.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
