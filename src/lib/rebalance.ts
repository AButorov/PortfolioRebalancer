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
 * Минимальный порог сделки — доля от стоимости портфеля.
 * Если сделка меньше порога, позиция считается сбалансированной.
 */
const TRADE_THRESHOLD = 0.001; // 0.1 %

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
    return { ...c, valueBase, currentPercent: null, delta: null };
  });

  // --- Total portfolio value ---
  const allValues = [
    ...enrichedStocks.map((s) => s.valueBase),
    ...enrichedCash.map((c) => c.valueBase),
  ];

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

  // --- Portfolio Drift ---
  const sumAbsDelta = [
    ...enrichedStocks.map((s) =>
      Math.abs((s.currentPercent ?? 0) - s.targetPercent),
    ),
    ...enrichedCash.map((c) =>
      Math.abs((c.currentPercent ?? 0) - c.targetPercent),
    ),
  ].reduce((acc, v) => acc + v, 0);
  const drift = sumAbsDelta / 2;

  // --- Stock recommendations ---
  const stocks: StockRecommendation[] = enrichedStocks.map((s) => {
    const targetValueBase = (s.targetPercent / 100) * totalValueBase;
    const price = s.price as number;
    const currency = s.currency as string;
    const priceBase = toBase(price, currency, baseCurrency, rates) as number;

    const targetQuantityRaw = Math.floor(targetValueBase / priceBase);
    let diff = targetQuantityRaw - s.quantity;
    let targetQuantity = targetQuantityRaw;
    let tradeValueBase: number | null = diff * priceBase;

    // Фильтр шума: сделка < TRADE_THRESHOLD от портфеля → держать
    if (Math.abs(tradeValueBase) / totalValueBase < TRADE_THRESHOLD) {
      diff = 0;
      targetQuantity = s.quantity;
      tradeValueBase = 0;
    }

    return {
      ticker: s.ticker,
      currentQuantity: s.quantity,
      targetQuantity,
      diff,
      price: s.price,
      tradeValueBase,
    };
  });

  // --- Остаток после покупки акций ---
  const allocatedToStocksBase = stocks.reduce((sum, s) => {
    const priceData = prices[s.ticker];
    if (!priceData) return sum;
    const priceBase =
      toBase(priceData.price, priceData.currency, baseCurrency, rates) ?? 0;
    return sum + s.targetQuantity * priceBase;
  }, 0);
  const remainingBase = totalValueBase - allocatedToStocksBase;

  // --- Cash recommendations ---
  const totalCashTargetPercent = enrichedCash.reduce(
    (s, c) => s + c.targetPercent,
    0,
  );

  const cashRecs: CashRecommendation[] = enrichedCash.map((c) => {
    let targetValueBase: number;

    if (totalCashTargetPercent > 0) {
      targetValueBase =
        (c.targetPercent / totalCashTargetPercent) * remainingBase;
    } else {
      const totalCurrentCashBase = enrichedCash.reduce(
        (s, cc) => s + (cc.valueBase as number),
        0,
      );
      const share =
        totalCurrentCashBase > 0
          ? (c.valueBase as number) / totalCurrentCashBase
          : 1 / enrichedCash.length;
      targetValueBase = share * remainingBase;
    }

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
    rebalanceResult: { totalValueBase, drift, stocks, cash: cashRecs },
  };
}
