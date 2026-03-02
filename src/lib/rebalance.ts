import type {
  Portfolio,
  PriceMap,
  RateMap,
  StockPositionEnriched,
  CashPositionEnriched,
  RebalanceResult,
  StockRecommendation,
  CashRecommendation,
} from "@/lib/types";

interface EnrichResult {
  enrichedStocks: StockPositionEnriched[];
  enrichedCash: CashPositionEnriched[];
  rebalanceResult: RebalanceResult | null;
}

/**
 * Конвертирует сумму из валюты в базовую.
 * Если курс не найден — возвращает null.
 */
function toBase(
  amount: number,
  currency: string,
  baseCurrency: string,
  rates: RateMap,
): number | null {
  if (currency === baseCurrency) return amount;
  const rate = rates[currency];
  if (rate == null) return null;
  return amount * rate;
}

/**
 * Обогащает позиции текущими ценами и рассчитывает ребалансировку.
 */
export function enrichPositions(
  portfolio: Portfolio,
  prices: PriceMap,
  rates: RateMap,
): EnrichResult {
  const { baseCurrency, positions, cash } = portfolio;

  // --- Enrich stocks ---
  const enrichedStocks: StockPositionEnriched[] = positions.map((p) => {
    const priceData = prices[p.ticker];
    const price = priceData?.price ?? null;
    const currency = priceData?.currency ?? null;

    let valueBase: number | null = null;
    if (price != null && currency != null) {
      valueBase = toBase(price * p.quantity, currency, baseCurrency, rates);
    }

    return {
      ...p,
      price,
      currency,
      valueBase,
      currentPercent: null,
      delta: null,
    };
  });

  // --- Enrich cash ---
  const enrichedCash: CashPositionEnriched[] = cash.map((c) => {
    const valueBase = toBase(c.amount, c.currency, baseCurrency, rates);
    return {
      ...c,
      valueBase,
      currentPercent: null,
      delta: null,
    };
  });

  // --- Total portfolio value ---
  const stockValues = enrichedStocks.map((s) => s.valueBase);
  const cashValues = enrichedCash.map((c) => c.valueBase);
  const allValues = [...stockValues, ...cashValues];

  // Если хотя бы одно значение null — не можем считать проценты
  if (allValues.some((v) => v == null)) {
    return { enrichedStocks, enrichedCash, rebalanceResult: null };
  }

  const totalValueBase = (allValues as number[]).reduce((acc, v) => acc + v, 0);

  if (totalValueBase === 0) {
    return { enrichedStocks, enrichedCash, rebalanceResult: null };
  }

  // --- Compute currentPercent and delta ---
  for (const s of enrichedStocks) {
    s.currentPercent = ((s.valueBase as number) / totalValueBase) * 100;
    s.delta = s.targetPercent - s.currentPercent;
  }

  for (const c of enrichedCash) {
    c.currentPercent = ((c.valueBase as number) / totalValueBase) * 100;
    c.delta = c.targetPercent - c.currentPercent;
  }

  // --- Rebalance recommendations ---
  const stocks: StockRecommendation[] = enrichedStocks.map((s) => {
    const targetValueBase = (s.targetPercent / 100) * totalValueBase;
    const price = s.price as number;
    const currency = s.currency as string;

    // Переводим цену в базовую валюту для расчёта количества
    const priceBase = toBase(price, currency, baseCurrency, rates) as number;
    const targetQuantity = Math.round(targetValueBase / priceBase);
    const diff = targetQuantity - s.quantity;
    const tradeValueBase = diff * priceBase;

    return {
      ticker: s.ticker,
      currentQuantity: s.quantity,
      targetQuantity,
      diff,
      price: s.price,
      tradeValueBase,
    };
  });

  const cashRecs: CashRecommendation[] = enrichedCash.map((c) => {
    const targetValueBase = (c.targetPercent / 100) * totalValueBase;
    const rate = c.currency === baseCurrency ? 1 : (rates[c.currency] ?? 1);
    const targetAmount = targetValueBase / rate;
    const diff = targetAmount - c.amount;

    return {
      currency: c.currency,
      currentAmount: c.amount,
      targetAmount,
      diff,
    };
  });

  return {
    enrichedStocks,
    enrichedCash,
    rebalanceResult: {
      totalValueBase,
      stocks,
      cash: cashRecs,
    },
  };
}
