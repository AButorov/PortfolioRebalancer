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
import { fetchPrices as apiFetchPrices } from "@/services/finnhub";
import { fetchRatesForCurrencies } from "@/services/frankfurter";
import { useSettingsStore } from "@/store/settingsStore";

import type { PriceMode } from "@/store/settingsStore";

const LS_KEY = "pr-finnhub-key";

// Тип расширенного JSON-файла (настройки поверх Portfolio)
type PortfolioFile = Portfolio & {
  finnhubApiKey?: string;
  priceMode?: PriceMode;
};

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

  /** Finnhub API key — хранится в localStorage + в JSON-файле портфеля */
  finnhubApiKey: string;

  setPortfolio: (portfolio: Portfolio) => void;
  setBaseCurrency: (currency: string) => void;

  addStock: () => void;
  updateStock: (index: number, position: Partial<StockPosition>) => void;
  removeStock: (index: number) => void;

  addCash: () => void;
  updateCash: (index: number, position: Partial<CashPosition>) => void;
  removeCash: (index: number) => void;

  setPrices: (prices: PriceMap) => void;
  setRates: (rates: RateMap) => void;
  setFetchStatus: (status: FetchStatus, error?: string) => void;

  /** Сохраняет ключ в store и localStorage */
  setFinnhubApiKey: (key: string) => void;

  fetchAllPrices: () => Promise<void>;
  fetchAllRates: () => Promise<void>;
  refresh: () => Promise<void>;

  loadFromFile: (file: File) => Promise<void>;
  saveToFile: () => void;

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
  finnhubApiKey: localStorage.getItem(LS_KEY) ?? "",

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
    get().computeEnriched();
  },

  setBaseCurrency: (currency) => {
    set((s) => ({ portfolio: { ...s.portfolio, baseCurrency: currency } }));
    get().computeEnriched();
  },

  setFinnhubApiKey: (key) => {
    localStorage.setItem(LS_KEY, key);
    set({ finnhubApiKey: key });
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
    get().computeEnriched();
  },

  updateStock: (index, updated) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        positions: s.portfolio.positions.map((p, i) =>
          i === index ? { ...p, ...updated } : p,
        ),
      },
    }));
    get().computeEnriched();
  },

  removeStock: (index) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        positions: s.portfolio.positions.filter((_, i) => i !== index),
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
    get().computeEnriched();
  },

  updateCash: (index, updated) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        cash: s.portfolio.cash.map((c, i) =>
          i === index ? { ...c, ...updated } : c,
        ),
      },
    }));
    get().computeEnriched();
  },

  removeCash: (index) => {
    set((s) => ({
      portfolio: {
        ...s.portfolio,
        cash: s.portfolio.cash.filter((_, i) => i !== index),
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
    const { portfolio, finnhubApiKey, setPrices } = get();
    const tickers = portfolio.positions.map((p) => p.ticker).filter(Boolean);
    if (tickers.length === 0) return;

    const { priceMode } = useSettingsStore.getState();

    const { prices: priceList, errors } = await apiFetchPrices(
      tickers,
      finnhubApiKey || undefined,
      priceMode,
    );

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
    const {
      setFetchStatus,
      fetchAllPrices,
      fetchAllRates,
      portfolio,
      finnhubApiKey,
    } = get();

    // Если есть акции, но нет ключа — сразу сообщаем
    if (portfolio.positions.length > 0 && !finnhubApiKey) {
      setFetchStatus("error", "NO_API_KEY");
      return;
    }

    setFetchStatus("loading");

    const [pricesResult, ratesResult] = await Promise.allSettled([
      fetchAllPrices(),
      fetchAllRates(),
    ]);

    const errors: string[] = [];
    if (pricesResult.status === "rejected") {
      const msg =
        pricesResult.reason instanceof Error
          ? pricesResult.reason.message
          : String(pricesResult.reason);
      errors.push(msg);
    }
    if (ratesResult.status === "rejected") {
      errors.push(
        ratesResult.reason instanceof Error
          ? ratesResult.reason.message
          : String(ratesResult.reason),
      );
    }

    if (errors.length > 0) {
      setFetchStatus("error", errors.join("; "));
    } else {
      set({ fetchStatus: "success", lastUpdated: new Date() });
    }
  },

  loadFromFile: async (file: File) => {
    const text = await file.text();
    const raw = JSON.parse(text) as PortfolioFile;

    const { setPriceMode } = useSettingsStore.getState();

    // Считываем настройки из файла
    if (raw.finnhubApiKey) {
      localStorage.setItem(LS_KEY, raw.finnhubApiKey);
      set({ finnhubApiKey: raw.finnhubApiKey });
    }
    if (raw.priceMode === "previousClose" || raw.priceMode === "lastTrade") {
      setPriceMode(raw.priceMode);
    }

    // Очищаем служебные поля перед сохранением в store
    const portfolio = { ...raw } as PortfolioFile;
    delete portfolio.finnhubApiKey;
    delete portfolio.priceMode;
    get().setPortfolio(portfolio as Portfolio);
  },

  saveToFile: () => {
    const { portfolio, finnhubApiKey } = get();
    const { priceMode } = useSettingsStore.getState();

    // Предлагаем пользователю ввести имя файла
    const raw = window.prompt("Имя файла / File name", "portfolio");
    if (raw === null) return; // пользователь нажал «Отмена»

    // Нормализуем: убираем пробелы, добавляем .json если нет
    const trimmed = raw.trim() || "portfolio";
    const filename = trimmed.endsWith(".json") ? trimmed : `${trimmed}.json`;

    const data: PortfolioFile = {
      ...portfolio,
      ...(finnhubApiKey ? { finnhubApiKey } : {}),
      priceMode,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
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
