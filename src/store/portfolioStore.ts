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

interface PortfolioState {
  // --- Raw portfolio data ---
  portfolio: Portfolio;

  // --- Enriched data ---
  enrichedStocks: StockPositionEnriched[];
  enrichedCash: CashPositionEnriched[];

  // --- External data ---
  prices: PriceMap;
  rates: RateMap;

  // --- Rebalance result ---
  rebalanceResult: RebalanceResult | null;

  // --- Status ---
  fetchStatus: FetchStatus;
  fetchError: string | null;

  // --- Portfolio actions ---
  setPortfolio: (portfolio: Portfolio) => void;
  setBaseCurrency: (currency: string) => void;

  // --- Stock actions ---
  addStock: (position: StockPosition) => void;
  updateStock: (ticker: string, position: Partial<StockPosition>) => void;
  removeStock: (ticker: string) => void;

  // --- Cash actions ---
  addCash: (position: CashPosition) => void;
  updateCash: (currency: string, position: Partial<CashPosition>) => void;
  removeCash: (currency: string) => void;

  // --- External data actions ---
  setPrices: (prices: PriceMap) => void;
  setRates: (rates: RateMap) => void;
  setFetchStatus: (status: FetchStatus, error?: string) => void;

  // --- Compute ---
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

  setPortfolio: (portfolio) => {
    set({
      portfolio,
      prices: {},
      rates: {},
      rebalanceResult: null,
      fetchStatus: "idle",
      fetchError: null,
    });
  },

  setBaseCurrency: (currency) => {
    set((state) => ({
      portfolio: { ...state.portfolio, baseCurrency: currency },
    }));
  },

  addStock: (position) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        positions: [...state.portfolio.positions, position],
      },
    }));
  },

  updateStock: (ticker, updated) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        positions: state.portfolio.positions.map((p) =>
          p.ticker === ticker ? { ...p, ...updated } : p,
        ),
      },
    }));
  },

  removeStock: (ticker) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        positions: state.portfolio.positions.filter((p) => p.ticker !== ticker),
      },
    }));
  },

  addCash: (position) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        cash: [...state.portfolio.cash, position],
      },
    }));
  },

  updateCash: (currency, updated) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        cash: state.portfolio.cash.map((c) =>
          c.currency === currency ? { ...c, ...updated } : c,
        ),
      },
    }));
  },

  removeCash: (currency) => {
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        cash: state.portfolio.cash.filter((c) => c.currency !== currency),
      },
    }));
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
