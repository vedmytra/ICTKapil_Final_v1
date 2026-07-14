export type AssetClass = "forex" | "gold" | "silver" | "crypto";

export interface InstrumentSpec {
  symbol: string;
  label: string;
  assetClass: AssetClass;
  /** Size of one standard lot/contract in base units. */
  contractSize: number;
  /** Smallest price increment representing "1 pip" for this instrument. */
  pipSize: number;
  /** Decimal places typically quoted. */
  quoteDecimals: number;
}

export const INSTRUMENTS: InstrumentSpec[] = [
  // Forex majors — standard lot = 100,000 units, pip = 0.0001 (0.01 for JPY pairs)
  { symbol: "EURUSD", label: "EUR/USD", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },
  { symbol: "GBPUSD", label: "GBP/USD", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },
  { symbol: "USDJPY", label: "USD/JPY", assetClass: "forex", contractSize: 100000, pipSize: 0.01, quoteDecimals: 3 },
  { symbol: "USDCHF", label: "USD/CHF", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },
  { symbol: "AUDUSD", label: "AUD/USD", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },
  { symbol: "USDCAD", label: "USD/CAD", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },
  { symbol: "NZDUSD", label: "NZD/USD", assetClass: "forex", contractSize: 100000, pipSize: 0.0001, quoteDecimals: 5 },

  // Metals — 1 lot XAUUSD = 100 oz, "pip" = $0.01 move by convention; XAGUSD = 5000 oz
  { symbol: "XAUUSD", label: "Gold (XAU/USD)", assetClass: "gold", contractSize: 100, pipSize: 0.01, quoteDecimals: 2 },
  { symbol: "XAGUSD", label: "Silver (XAG/USD)", assetClass: "silver", contractSize: 5000, pipSize: 0.001, quoteDecimals: 3 },

  // Crypto — quoted per coin, "lot" = 1 coin, pip is illustrative (1 unit price move)
  { symbol: "BTCUSD", label: "Bitcoin (BTC/USD)", assetClass: "crypto", contractSize: 1, pipSize: 1, quoteDecimals: 1 },
  { symbol: "ETHUSD", label: "Ethereum (ETH/USD)", assetClass: "crypto", contractSize: 1, pipSize: 0.1, quoteDecimals: 2 },
];

export function getInstrument(symbol: string): InstrumentSpec {
  return INSTRUMENTS.find((i) => i.symbol === symbol) ?? INSTRUMENTS[0];
}

/**
 * Pip value in account currency for 1 standard lot.
 * Simplified model: assumes account currency == quote currency (USD),
 * which holds for all *USD pairs and metals/crypto listed above.
 * For cross pairs quoted in a different currency, a conversion rate
 * would need to be applied on top of this.
 */
export function pipValuePerLot(instrument: InstrumentSpec): number {
  return instrument.pipSize * instrument.contractSize;
}

export interface PipCalcInput {
  symbol: string;
  lotSize: number;
}
export function calculatePipValue({ symbol, lotSize }: PipCalcInput): number {
  const instrument = getInstrument(symbol);
  return pipValuePerLot(instrument) * lotSize;
}

export interface LotSizeCalcInput {
  symbol: string;
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
}
export interface LotSizeResult {
  riskAmount: number;
  lotSize: number;
  pipValue: number;
}
export function calculateLotSize(input: LotSizeCalcInput): LotSizeResult {
  const instrument = getInstrument(input.symbol);
  const riskAmount = (input.accountBalance * input.riskPercent) / 100;
  const pipValFullLot = pipValuePerLot(instrument);
  const lotSize =
    input.stopLossPips > 0 && pipValFullLot > 0
      ? riskAmount / (input.stopLossPips * pipValFullLot)
      : 0;
  return {
    riskAmount,
    lotSize: Number(lotSize.toFixed(2)),
    pipValue: Number((pipValFullLot * lotSize).toFixed(2)),
  };
}

export interface PositionSizeCalcInput {
  symbol: string;
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
}
export interface PositionSizeResult {
  riskAmount: number;
  stopDistance: number;
  units: number;
  lots: number;
}
export function calculatePositionSize(input: PositionSizeCalcInput): PositionSizeResult {
  const instrument = getInstrument(input.symbol);
  const riskAmount = (input.accountBalance * input.riskPercent) / 100;
  const stopDistance = Math.abs(input.entryPrice - input.stopLossPrice);
  const units = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const lots = units / instrument.contractSize;
  return {
    riskAmount,
    stopDistance,
    units: Number(units.toFixed(2)),
    lots: Number(lots.toFixed(2)),
  };
}

export interface RiskCalcInput {
  accountBalance: number;
  entryPrice: number;
  stopLossPrice: number;
  lotSize: number;
  symbol: string;
}
export interface RiskCalcResult {
  riskAmount: number;
  riskPercent: number;
  rewardAmount: number;
  riskRewardRatio: number | null;
}
export function calculateRisk(
  input: RiskCalcInput & { takeProfitPrice?: number }
): RiskCalcResult {
  const instrument = getInstrument(input.symbol);
  const stopDistance = Math.abs(input.entryPrice - input.stopLossPrice);
  const riskAmount = stopDistance * instrument.contractSize * input.lotSize;
  const riskPercent = input.accountBalance > 0 ? (riskAmount / input.accountBalance) * 100 : 0;

  let rewardAmount = 0;
  let riskRewardRatio: number | null = null;
  if (input.takeProfitPrice !== undefined) {
    const rewardDistance = Math.abs(input.takeProfitPrice - input.entryPrice);
    rewardAmount = rewardDistance * instrument.contractSize * input.lotSize;
    riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : null;
  }

  return {
    riskAmount: Number(riskAmount.toFixed(2)),
    riskPercent: Number(riskPercent.toFixed(2)),
    rewardAmount: Number(rewardAmount.toFixed(2)),
    riskRewardRatio: riskRewardRatio !== null ? Number(riskRewardRatio.toFixed(2)) : null,
  };
}
