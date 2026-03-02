/**
 * Currency exchange rates via frankfurter.app (free, no API key required).
 * Uses latest ECB rates (updated ~16:00 CET on business days).
 */

const BASE_URL = "https://api.frankfurter.app";

export type ExchangeRates = Record<string, number>;

export interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: ExchangeRates;
}

/**
 * Fetches the latest exchange rates for the given base currency.
 * Returns a map: { "EUR": 0.92, "GBP": 0.79, ... }
 * The base currency itself is not included in the result.
 */
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
 * Converts an amount from one currency to another using latest rates.
 * Returns the converted amount.
 */
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

/**
 * Fetches rates for multiple currencies at once relative to baseCurrency.
 * Includes baseCurrency itself in the result (rate = 1).
 */
export async function fetchRatesForCurrencies(
  baseCurrency: string,
  currencies: string[],
): Promise<ExchangeRates> {
  const others = currencies.filter((c) => c !== baseCurrency);

  const rates: ExchangeRates = { [baseCurrency]: 1 };

  if (others.length === 0) return rates;

  const symbols = others.join(",");
  const url = `${BASE_URL}/latest?base=${encodeURIComponent(baseCurrency)}&symbols=${encodeURIComponent(symbols)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `frankfurter.app error: ${response.status} ${response.statusText}`,
    );
  }

  const data: FrankfurterResponse = await response.json();

  for (const currency of others) {
    const rate = data.rates[currency];
    if (rate === undefined) {
      throw new Error(
        `Currency "${currency}" not found in frankfurter.app response`,
      );
    }
    rates[currency] = rate;
  }

  return rates;
}
