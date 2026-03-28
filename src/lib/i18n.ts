export type Lang = "ru" | "en";

export interface Translations {
  // Header
  refresh: string;
  load: string;
  save: string;
  settings: string;
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
  /** Подсказка к клику по «Факт %» */
  copyPercentHint: string;
  /**
   * Tooltip кнопки коррекции целевого % базовой валюты.
   * @param currency — базовая валюта (напр. USD)
   * @param percent  — значение, до которого будет скорректирован % (напр. 5.23)
   */
  adjustBaseCurrencyTitle: (currency: string, percent: number) => string;
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
  /**
   * Текст тултипа при некорректной сумме целевых процентов.
   * @param total — фактическая сумма (напр. 110)
   * @param deviation — отклонение от 100 со знаком (напр. +10 или -5)
   */
  targetSumWarning: (total: number, deviation: number) => string;
  // PortfolioChart
  addPositionsHint: string;
  positions: string;
  actualVsTarget: string;
  // Settings panel
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  apiKeyHint: string;
  apiKeyNote: string;
  apiKeyWarningTitle: string;
  apiKeyWarningBody: string;
  apiKeySaved: string;
  // Price mode
  priceModeLabel: string;
  priceModeClose: string;
  priceModeCloseSub: string;
  priceModeLast: string;
  priceModeLastSub: string;
  // Intl locale
  locale: string;
}

const ru: Translations = {
  refresh: "Обновить",
  load: "Загрузить",
  save: "Сохранить",
  settings: "Настройки",
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
  copyPercentHint: "Нажмите, чтобы скопировать в «Цель %»",
  adjustBaseCurrencyTitle: (currency, percent) =>
    `Скорректировать целевой % ${currency} до ${percent.toFixed(2)}%\n` +
    `(100% − сумма остальных позиций).\n` +
    `Дробный остаток будет добавлен в базовую валюту.`,
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
  targetSumWarning: (total, deviation) =>
    `Сумма целевых процентов: ${total.toFixed(2)}% (${deviation > 0 ? "+" : ""}${deviation.toFixed(2)}% от 100%).\n` +
    `Данные ребалансировки носят информативный характер и могут быть некорректны.\n` +
    `Скорректируйте целевые проценты так, чтобы их сумма равнялась 100%.`,
  addPositionsHint: "Добавьте позиции",
  positions: "позиций",
  actualVsTarget: "Факт vs цель",
  apiKeyLabel: "Finnhub API ключ",
  apiKeyPlaceholder: "Введите ключ...",
  apiKeyHint: "Бесплатный ключ — finnhub.io",
  apiKeyNote: "Ключ сохраняется в JSON-файл портфеля и читается при загрузке.",
  apiKeyWarningTitle: "API ключ не настроен",
  apiKeyWarningBody:
    "Для загрузки котировок акций введите Finnhub API ключ в настройках (⚙). Бесплатная регистрация на finnhub.io.",
  apiKeySaved: "Ключ сохранён",
  priceModeLabel: "Цена акции",
  priceModeClose: "Цена закрытия",
  priceModeCloseSub:
    "Цена закрытия предыдущего торгового дня. Стабильна, не меняется в течение дня.",
  priceModeLast: "Последняя сделка",
  priceModeLastSub:
    "Цена последней совершённой сделки. Актуальна при высокой волатильности.",
  locale: "ru-RU",
};

const en: Translations = {
  refresh: "Refresh",
  load: "Load",
  save: "Save",
  settings: "Settings",
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
  copyPercentHint: "Click to copy to Target %",
  adjustBaseCurrencyTitle: (currency, percent) =>
    `Adjust ${currency} target % to ${percent.toFixed(2)}%\n` +
    `(100% − sum of all other positions).\n` +
    `The fractional remainder will be allocated to the base currency.`,
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
  targetSumWarning: (total, deviation) =>
    `Target allocation sum: ${total.toFixed(2)}% (${deviation > 0 ? "+" : ""}${deviation.toFixed(2)}% from 100%).\n` +
    `Rebalancing data is informational only and may be incorrect.\n` +
    `Adjust target percentages so they sum to exactly 100%.`,
  addPositionsHint: "Add positions",
  positions: "positions",
  actualVsTarget: "Actual vs target",
  apiKeyLabel: "Finnhub API Key",
  apiKeyPlaceholder: "Enter key...",
  apiKeyHint: "Get a free key at finnhub.io",
  apiKeyNote: "The key is saved to the portfolio JSON file and loaded with it.",
  apiKeyWarningTitle: "API key not configured",
  apiKeyWarningBody:
    "To fetch stock quotes, add a Finnhub API key in settings (⚙). Free registration at finnhub.io.",
  apiKeySaved: "Key saved",
  priceModeLabel: "Stock price",
  priceModeClose: "Previous close",
  priceModeCloseSub:
    "Official closing price from the previous trading day. Stable throughout the day.",
  priceModeLast: "Last trade",
  priceModeLastSub:
    "Price of the most recent transaction. Useful during high volatility.",
  locale: "en-US",
};

export const translations: Record<Lang, Translations> = { ru, en };
