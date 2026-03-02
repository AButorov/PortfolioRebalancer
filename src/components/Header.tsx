import { useRef, useState } from "react";
import { RefreshCw, Upload, Download, TrendingUp } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";

const CURRENCIES = ["USD", "EUR", "GBP", "RUB", "CNY", "JPY", "TRY", "CHF"];

export function Header() {
  const {
    portfolio,
    setBaseCurrency,
    loadFromFile,
    saveToFile,
    refresh,
    fetchStatus,
    lastUpdated,
  } = usePortfolioStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState(0);
  const isLoading = fetchStatus === "loading";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadFromFile(file);
      setFileKey((k) => k + 1);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold text-sm tracking-tight hidden sm:block">
            Portfolio Rebalancer
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Last updated */}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground tabular-nums hidden md:block">
              {lastUpdated.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {/* Base currency */}
          <select
            value={portfolio.baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Обновить</span>
          </button>

          {/* Load */}
          <button
            onClick={() => fileRef.current?.click()}
            className="h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Загрузить</span>
          </button>
          <input
            key={fileKey}
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFile}
          />

          {/* Save */}
          <button
            onClick={saveToFile}
            className="h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Сохранить</span>
          </button>
        </div>
      </div>
    </header>
  );
}
