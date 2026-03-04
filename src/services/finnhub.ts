/**
 * Stock price fetching via Finnhub.io
 *
 * Free tier: 60 API calls/minute, no backend needed, CORS supported.
 * Registration: https://finnhub.io → Dashboard → API Key
 *
 * The API key can be:
 *   1. Saved in the portfolio JSON file (recommended — personal, local)
 *   2. Set in .env as VITE_FINNHUB_API_KEY (fallback for dev environments)
 *
 * Ticker format:
 *   AAPL, MSFT, MU         → US stocks
 *   BMW.DE (→ XETRA:BMW)   → auto-mapped by exchange suffix
 *
 * Exchange suffix mapping:
 *   no suffix → US (NASDAQ/NYSE)
 *   .DE       → XETRA
 *   .L        → LSE
 *   .T        → TSE (Tokyo)
 *   .HK       → HKEX
 *   etc.
 */

import type { TickerPrice } from "@/lib/types";

const ENV_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined;
const BASE_URL = "https://finnhub.io/api/v1";

// Yahoo-style suffix → Finnhub exchange prefix
const SUFFIX_TO_EXCHANGE: Record<string, { prefix: string; currency: string }> =
  {
    DE: { prefix: "XETRA", currency: "EUR" },
    L: { prefix: "LSE", currency: "GBP" },
    T: { prefix: "TSE", currency: "JPY" },
    HK: { prefix: "HKEX", currency: "HKD" },
    AX: { prefix: "ASX", currency: "AUD" },
    TO: { prefix: "TSX", currency: "CAD" },
    SW: { prefix: "SWX", currency: "CHF" },
    PA: { prefix: "EURONEXT", currency: "EUR" },
    AS: { prefix: "EURONEXT", currency: "EUR" },
    BR: { prefix: "EURONEXT", currency: "EUR" },
  };

interface FinnhubQuote {
  c: number; // current price
  pc: number; // previous close
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  t: number; // timestamp
}

/**
 * Converts a Yahoo-style ticker (AAPL, BMW.DE) to a Finnhub symbol + currency.
 */
function toFinnhub(ticker: string): { symbol: string; currency: string } {
  const dotIdx = ticker.lastIndexOf(".");
  if (dotIdx > 0) {
    const base = ticker.slice(0, dotIdx).toUpperCase();
    const suffix = ticker.slice(dotIdx + 1).toUpperCase();
    const exchange = SUFFIX_TO_EXCHANGE[suffix];
    if (exchange) {
      return {
        symbol: `${exchange.prefix}:${base}`,
        currency: exchange.currency,
      };
    }
    return { symbol: ticker.toUpperCase(), currency: "USD" };
  }
  return { symbol: ticker.toUpperCase(), currency: "USD" };
}

async function fetchTickerPrice(
  ticker: string,
  apiKey: string,
): Promise<TickerPrice> {
  const { symbol, currency } = toFinnhub(ticker);
  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Finnhub HTTP ${response.status} for ${ticker}`);
  }

  const data: FinnhubQuote = await response.json();

  // previousClose is the most reliable for EOD price
  const price = data.pc > 0 ? data.pc : data.c;
  if (!price || price <= 0) {
    throw new Error(
      `No price data for ${ticker} (symbol not found or market closed)`,
    );
  }

  return { ticker, price, currency };
}

/**
 * Fetches previous-close prices for a list of tickers via Finnhub.
 *
 * @param tickers  - list of ticker symbols
 * @param apiKey   - Finnhub API key (overrides VITE_FINNHUB_API_KEY env var)
 */
export async function fetchPrices(
  tickers: string[],
  apiKey?: string,
): Promise<{
  prices: Map<string, TickerPrice>;
  errors: Map<string, string>;
}> {
  const resolvedKey = apiKey || ENV_API_KEY;

  if (!resolvedKey) {
    throw new Error("NO_API_KEY");
  }

  const unique = [...new Set(tickers)];
  const results = await Promise.allSettled(
    unique.map((t) => fetchTickerPrice(t, resolvedKey)),
  );

  const prices = new Map<string, TickerPrice>();
  const errors = new Map<string, string>();

  results.forEach((result, index) => {
    const ticker = unique[index];
    if (result.status === "fulfilled") {
      prices.set(ticker, result.value);
    } else {
      errors.set(
        ticker,
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
      );
    }
  });

  return { prices, errors };
}
