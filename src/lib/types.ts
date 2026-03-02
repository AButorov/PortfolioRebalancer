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
}

// --- Enriched data (after fetching prices) ---

export interface StockPositionEnriched extends StockPosition {
  price: number | null; // цена в валюте торгов
  currency: string | null; // валюта торгов (USD, EUR, ...)
  valueBase: number | null; // стоимость в базовой валюте
  currentPercent: number | null;
  delta: number | null; // targetPercent - currentPercent
}

export interface CashPositionEnriched extends CashPosition {
  valueBase: number | null; // стоимость в базовой валюте
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
  [currency: string]: number; // rate to baseCurrency
}

export interface TickerPrice {
  ticker: string;
  price: number; // в валюте инструмента
  currency: string;
}
