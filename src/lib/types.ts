// --- Portfolio JSON structure ---

export interface StockPosition {
  ticker: string;
  quantity: number;
  targetPercent: number;
}

export interface CashPosition {
  currency: string;
  amount: number;
  targetPercent: number;
}

export interface Portfolio {
  baseCurrency: string;
  positions: StockPosition[];
  cash: CashPosition[];
  finnhubApiKey?: string; // сохраняется в JSON-файле портфеля
}

// --- Enriched data (after fetching prices) ---

export interface StockPositionEnriched extends StockPosition {
  price: number | null;
  currency: string | null;
  valueBase: number | null;
  currentPercent: number | null;
  delta: number | null; // targetPercent - currentPercent
}

export interface CashPositionEnriched extends CashPosition {
  valueBase: number | null;
  currentPercent: number | null;
  delta: number | null;
}

// --- Rebalance recommendations ---

export interface StockRecommendation {
  ticker: string;
  currentQuantity: number;
  targetQuantity: number;
  diff: number; // +купить / -продать
  price: number | null;
  tradeValueBase: number | null;
}

export interface CashRecommendation {
  currency: string;
  currentAmount: number;
  targetAmount: number;
  diff: number; // +добавить / -вывести
}

export interface RebalanceResult {
  totalValueBase: number;
  /**
   * Portfolio Drift — доля портфеля, которую нужно переложить для
   * достижения целевых весов.
   *
   * drift = 0.5 × Σ|currentPercent[i] - targetPercent[i]|
   *
   * Диапазон: 0% (идеально) … 100% (полное несоответствие).
   * Практические пороги: <5% — ок, 5–10% — рассмотреть, >10% — ребалансировать.
   */
  drift: number;
  stocks: StockRecommendation[];
  cash: CashRecommendation[];
}

// --- API ---

export type FetchStatus = "idle" | "loading" | "success" | "error";

export interface PriceMap {
  [ticker: string]: {
    price: number;
    currency: string;
  };
}

export interface RateMap {
  [currency: string]: number; // units of baseCurrency per 1 unit of currency
}

export interface TickerPrice {
  ticker: string;
  price: number;
  currency: string;
}
