import type { TickerPrice } from "@/lib/types";

const PROXY_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const CORS_PROXY = "https://corsproxy.io/?";

function buildUrl(ticker: string): string {
  const params = new URLSearchParams({
    interval: "1d",
    range: "5d",
  });
  return `${CORS_PROXY}${encodeURIComponent(`${PROXY_BASE}/${ticker}?${params}`)}`;
}

interface YahooChartResult {
  meta: {
    regularMarketPrice: number;
    previousClose: number;
    currency: string;
    symbol: string;
  };
}

interface YahooResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: { code: string; description: string } | null;
  };
}

async function fetchTickerPrice(ticker: string): Promise<TickerPrice> {
  const url = buildUrl(ticker);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${ticker}`);
  }

  const data: YahooResponse = await response.json();

  if (data.chart.error) {
    throw new Error(
      `Yahoo Finance error for ${ticker}: ${data.chart.error.description}`,
    );
  }

  const result = data.chart.result?.[0];
  if (!result) {
    throw new Error(`No data returned for ${ticker}`);
  }

  const price = result.meta.previousClose ?? result.meta.regularMarketPrice;
  if (!price || price <= 0) {
    throw new Error(`Invalid price for ${ticker}`);
  }

  return {
    ticker,
    price,
    currency: result.meta.currency,
  };
}

/**
 * Fetches previous-close prices for a list of tickers.
 * Returns a map of ticker → TickerPrice (successful) and errors map for failures.
 */
export async function fetchPrices(tickers: string[]): Promise<{
  prices: Map<string, TickerPrice>;
  errors: Map<string, string>;
}> {
  const unique = [...new Set(tickers)];
  const results = await Promise.allSettled(unique.map(fetchTickerPrice));

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
