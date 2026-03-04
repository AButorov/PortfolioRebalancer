export type Lang = "ru" | "en";

export interface Translations {
  // Header
  refresh: string;
  load: string;
  save: string;
  // App sections
  portfolio: string;
  structure: string;
  rebalancing: string;
  // PortfolioTable
  stocks: string;
  cash: string;
  ticker: string;
  quantity: string;
  price: string;
  value: string;
  actualPercent: string;
  targetPercent: string;
  noPositions: string;
  noCashPositions: string;
  addStock: string;
  addCurrency: string;
  currency: string;
  amount: string;
  inCurrency: (c: string) => string;
  // RebalanceTable
  loadingData: string;
  loadError: string;
  clickRefreshHint: string;
  total: string;
  current: string;
  target: string;
  diff: string;
  action: string;
  hold: string;
  buy: string;
  sell: string;
  pieces: string;
  driftNormal: string;
  driftConsider: string;
  driftRebalance: string;
  driftTitle: string;
  // PortfolioChart
  addPositionsHint: string;
  positions: string;
  actualVsTarget: string;
  // Intl locale
  locale: string;
}

const ru: Translations = {
  refresh: "Обновить",
  load: "Загрузить",
  save: "Сохранить",
  portfolio: "Портфель",
  structure: "Структура",
  rebalancing: "Ребалансировка",
  stocks: "Акции",
  cash: "Кэш",
  ticker: "Тикер",
  quantity: "Кол-во",
  price: "Цена",
  value: "Стоимость",
  actualPercent: "Факт %",
  targetPercent: "Цель %",
  noPositions: "Нет позиций",
  noCashPositions: "Нет валютных позиций",
  addStock: "Добавить акцию",
  addCurrency: "Добавить валюту",
  currency: "Валюта",
  amount: "Сумма",
  inCurrency: (c) => `В ${c}`,
  loadingData: "Загрузка данных...",
  loadError: "Ошибка загрузки:",
  clickRefreshHint: "Нажмите «Обновить» чтобы загрузить котировки",
  total: "Итого:",
  current: "Сейчас",
  target: "Целевое",
  diff: "Разница",
  action: "Действие",
  hold: "Держать",
  buy: "Купить",
  sell: "Продать",
  pieces: "шт.",
  driftNormal: "в норме",
  driftConsider: "рассмотреть",
  driftRebalance: "ребалансировать",
  driftTitle:
    "Portfolio Drift — доля портфеля, которую нужно переложить для достижения целевых весов",
  addPositionsHint: "Добавьте позиции",
  positions: "позиций",
  actualVsTarget: "Факт vs цель",
  locale: "ru-RU",
};

const en: Translations = {
  refresh: "Refresh",
  load: "Load",
  save: "Save",
  portfolio: "Portfolio",
  structure: "Structure",
  rebalancing: "Rebalancing",
  stocks: "Stocks",
  cash: "Cash",
  ticker: "Ticker",
  quantity: "Qty",
  price: "Price",
  value: "Value",
  actualPercent: "Actual %",
  targetPercent: "Target %",
  noPositions: "No positions",
  noCashPositions: "No cash positions",
  addStock: "Add stock",
  addCurrency: "Add currency",
  currency: "Currency",
  amount: "Amount",
  inCurrency: (c) => `In ${c}`,
  loadingData: "Loading data...",
  loadError: "Load error:",
  clickRefreshHint: "Click Refresh to load quotes",
  total: "Total:",
  current: "Current",
  target: "Target",
  diff: "Diff",
  action: "Action",
  hold: "Hold",
  buy: "Buy",
  sell: "Sell",
  pieces: "pcs.",
  driftNormal: "normal",
  driftConsider: "consider",
  driftRebalance: "rebalance",
  driftTitle:
    "Portfolio Drift — share of the portfolio that needs to be reallocated to reach target weights",
  addPositionsHint: "Add positions",
  positions: "positions",
  actualVsTarget: "Actual vs target",
  locale: "en-US",
};

export const translations: Record<Lang, Translations> = { ru, en };
