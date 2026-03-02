import { create } from "zustand";
import type {
  Portfolio,
  StockPosition,
  CashPosition,
  StockPositionEnriched,
  CashPositionEnriched,
  PriceMap,
  RateMap,
  RebalanceResult,
  FetchStatus,
} from "@/lib/types";
import { enrichPositions } from "@/lib/rebalance";
import { fetchPrices as apiFetchPrices } from "@/services/yahooFinance";
import { fetchRatesForCurrencies } from "@/services/frankfurter";

interface PortfolioState {
  portfolio: Portfolio;
  enrichedStocks: StockPositionEnriched[];
  enrichedCash: CashPositionEnriched[];
  prices: PriceMap;
  rates: RateMap;
  rebalanceResult: RebalanceResult | null;
  fetchStatus: FetchStatus;
  fetchError: string | null;
  lastUpdated: Date | null;

  // Portfolio
  setPortfolio: (portfolio: Portfolio) => void;
  setBaseCurrency: (currency: string) => void;

  // Stocks
  addStock: () => void;
  updateStock: (ticker: string, position: Partial<StockPosition>) => void;
  removeStock: (ticker: string) => void;

  // Cash
  addCash: () => void;
  updateCash: (currency: string, position: Partial<CashPosition>) => void;
  removeCash: (currency: string) => void;

  // External data
  setPrices: (prices: PriceMap) => void;
  setRates: (rates: RateMap) => void;
  setFetchStatus: (status: FetchStatus, error?: string) => void;

  // Async fetch
  fetchAllPrices: () => Promise<void>;
  fetchAllRates: () => Promise<void>;
  refresh: () => Promise<void>;

  // File I/O
  loadFromFile: (file: File) => Promise<void>;
  saveToFile: () => void;

  // Internal
  computeEnriched: () => void;
}

const defaultPortfolio: Portfolio = {
  baseCurrency: "USD",
  positions: [],
  cash: [],
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: defaultPortfolio,
  enrichedStocks: [],
  enrichedCash: [],
  prices: {},
  rates: {},
  rebalanceResult: null,
  fetchStatus: "idle",
  fetchError: null,
  lastUpdated: null,

  setPortfolio: (portfolio) => {
    set({
      portfolio,
      prices: {},
      rates: {},
      rebalanceResult: null,
      enrichedStocks: [],
      enrichedCash: [],
      fetchStatus: "idle",
      fetchError: null,
    });
  },

  setBaseCurrency: (currency) => {
    set((s) => ({ portfolio: { ...s.portfolio, baseCurrency: currency } }));
    get().computeEnriched();
  },

  addStock: () => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        positions: [
          ...s.portfolio.positions,
          { ticker: "", quantity: 0, targetPercent: 0 },
        ],
      },
    }));
  },

  updateStock: (ticker, updated) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        positions: s.portfolio.positions.map((p) =>
          p.ticker === ticker ? { ...p, ...updated } : p,
        ),
      },
    }));
    get().computeEnriched();
  },

  removeStock: (ticker) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        positions: s.portfolio.positions.filter((p) => p.ticker !== ticker),
      },
    }));
    get().computeEnriched();
  },

  addCash: () => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        cash: [
          ...s.portfolio.cash,
          { currency: "", amount: 0, targetPercent: 0 },
        ],
      },
    }));
  },

  updateCash: (currency, updated) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        cash: s.portfolio.cash.map((c) =>
          c.currency === currency ? { ...c, ...updated } : c,
        ),
      },
    }));
    get().computeEnriched();
  },

  removeCash: (currency) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        cash: s.portfolio.cash.filter((c) => c.currency !== currency),
      },
    }));
    get().computeEnriched();
  },

  setPrices: (prices) => {
    set({ prices });
    get().computeEnriched();
  },

  setRates: (rates) => {
    set({ rates });
    get().computeEnriched();
  },

  setFetchStatus: (status, error) => {
    set({ fetchStatus: status, fetchError: error ?? null });
  },

  fetchAllPrices: async () => {
    const { portfolio, setPrices } = get();
    const tickers = portfolio.positions.map((p) => p.ticker).filter(Boolean);
    if (tickers.length === 0) return;

    const { prices: priceList, errors } = await apiFetchPrices(tickers);
    if (errors.size > 0) {
      console.warn("Price fetch errors:", Object.fromEntries(errors));
    }

    const priceMap: PriceMap = {};
    for (const [ticker, data] of priceList.entries()) {
      priceMap[ticker] = { price: data.price, currency: data.currency };
    }
    setPrices(priceMap);
  },

  fetchAllRates: async () => {
    const { portfolio, setRates } = get();
    const currencies = portfolio.cash.map((c) => c.currency).filter(Boolean);
    if (currencies.length === 0) {
      setRates({ [portfolio.baseCurrency]: 1 });
      return;
    }
    const rates = await fetchRatesForCurrencies(
      portfolio.baseCurrency,
      currencies,
    );
    setRates(rates);
  },

  refresh: async () => {
    const { setFetchStatus, fetchAllPrices, fetchAllRates } = get();
    setFetchStatus("loading");
    try {
      await Promise.all([fetchAllPrices(), fetchAllRates()]);
      set({ fetchStatus: "success", lastUpdated: new Date() });
    } catch (e) {
      setFetchStatus("error", e instanceof Error ? e.message : String(e));
    }
  },

  loadFromFile: async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text) as Portfolio;
    get().setPortfolio(data);
  },

  saveToFile: () => {
    const { portfolio } = get();
    const json = JSON.stringify(portfolio, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  computeEnriched: () => {
    const { portfolio, prices, rates } = get();
    const { enrichedStocks, enrichedCash, rebalanceResult } = enrichPositions(
      portfolio,
      prices,
      rates,
    );
    set({ enrichedStocks, enrichedCash, rebalanceResult });
  },
}));
