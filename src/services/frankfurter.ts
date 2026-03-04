/**
 * Currency exchange rates via frankfurter.app (free, no API key).
 * Uses latest ECB rates (updated ~16:00 CET on business days).
 *
 * Supported: ~33 currencies (ECB basket). RUB is NOT supported since 2022.
 *
 * Rate semantics: rates[currency] = amount of `currency` per 1 `baseCurrency`.
 * Example: base=USD → rates["TRY"] = 38.5 means 1 USD = 38.5 TRY.
 *
 * toBase() in rebalance.ts does: valueBase = amount * rates[currency]
 * → we must store the INVERSE: rates[currency] = 1 / (TRY per USD) = 1/38.5 ≈ 0.026
 *   so that: 50 000 TRY * 0.026 ≈ 1 300 USD ✓
 */

const BASE_URL = "https://api.frankfurter.app";

export type ExchangeRates = Record<string, number>;

export interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: ExchangeRates;
}

export async function fetchExchangeRates(
  baseCurrency: string,
): Promise<ExchangeRates> {
  const url = `${BASE_URL}/latest?base=${encodeURIComponent(baseCurrency)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `frankfurter.app error: ${response.status} ${response.statusText}`,
    );
  }
  const data: FrankfurterResponse = await response.json();
  return data.rates;
}

/**
 * Fetches a single currency rate relative to baseCurrency.
 * Returns the INVERTED rate (i.e. 1 unit of `currency` in `baseCurrency`),
 * or null if the currency is not supported.
 */
async function fetchSingleRate(
  baseCurrency: string,
  currency: string,
): Promise<number | null> {
  const url = `${BASE_URL}/latest?base=${encodeURIComponent(baseCurrency)}&symbols=${encodeURIComponent(currency)}`;
  const response = await fetch(url);

  if (!response.ok) {
    // 404 / 422 — currency not supported
    return null;
  }

  const data: FrankfurterResponse = await response.json();
  const rawRate = data.rates[currency];

  if (rawRate == null || rawRate === 0) return null;

  // rawRate = units of `currency` per 1 `baseCurrency`
  // We need: units of `baseCurrency` per 1 `currency` = 1 / rawRate
  return 1 / rawRate;
}

/**
 * Fetches rates for multiple currencies relative to baseCurrency.
 * Result rates[currency] = value of 1 unit of `currency` in `baseCurrency`.
 * Unsupported currencies (e.g. RUB) are silently omitted.
 */
export async function fetchRatesForCurrencies(
  baseCurrency: string,
  currencies: string[],
): Promise<ExchangeRates> {
  const others = [...new Set(currencies.filter((c) => c !== baseCurrency))];

  // baseCurrency → itself is always 1
  const rates: ExchangeRates = { [baseCurrency]: 1 };

  if (others.length === 0) return rates;

  const results = await Promise.allSettled(
    others.map((c) => fetchSingleRate(baseCurrency, c)),
  );

  results.forEach((result, i) => {
    const currency = others[i];
    if (result.status === "fulfilled" && result.value !== null) {
      rates[currency] = result.value;
    }
    // rejected or null → unsupported, omit
  });

  return rates;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return amount;
  const url = `${BASE_URL}/latest?amount=${amount}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `frankfurter.app error: ${response.status} ${response.statusText}`,
    );
  }
  const data: FrankfurterResponse = await response.json();
  const converted = data.rates[to];
  if (converted === undefined) {
    throw new Error(`Currency "${to}" not found in frankfurter.app response`);
  }
  return converted;
}
