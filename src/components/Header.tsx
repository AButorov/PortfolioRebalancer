import { useRef, useState } from "react";
import {
  RefreshCw,
  Upload,
  Download,
  TrendingUp,
  Sun,
  Moon,
  Settings,
  X,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useSettingsStore } from "@/store/settingsStore";

const CURRENCIES = ["USD", "EUR", "GBP", "RUB", "CNY", "JPY", "TRY", "CHF"];

// ─── Панель настроек ─────────────────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { finnhubApiKey, setFinnhubApiKey } = usePortfolioStore();
  const { t } = useSettingsStore();

  const [localKey, setLocalKey] = useState(finnhubApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setFinnhubApiKey(localKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="absolute right-4 top-14 z-50 w-80 rounded-lg border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">{t.settings}</span>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          {/* Finnhub API key */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-xs font-medium">{t.apiKeyLabel}</label>
            </div>

            <input
              type="password"
              value={localKey}
              onChange={(e) => {
                setLocalKey(e.target.value);
                setSaved(false);
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={t.apiKeyPlaceholder}
              className="w-full h-8 px-3 text-xs font-mono rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:font-sans"
              autoComplete="off"
              spellCheck={false}
            />

            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t.apiKeyNote}
              </p>
              {saved && (
                <span className="text-[11px] text-green-600 dark:text-green-400 whitespace-nowrap shrink-0">
                  {t.apiKeySaved}
                </span>
              )}
            </div>

            <a
              href="https://finnhub.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {t.apiKeyHint}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header() {
  const {
    portfolio,
    setBaseCurrency,
    loadFromFile,
    saveToFile,
    refresh,
    fetchStatus,
    lastUpdated,
    finnhubApiKey,
  } = usePortfolioStore();
  const { theme, lang, t, toggleTheme, toggleLang } = useSettingsStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const isLoading = fetchStatus === "loading";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadFromFile(file);
      setFileKey((k) => k + 1);
    }
  };

  const handleRefresh = () => {
    // Если есть акции, но API ключ не задан — открываем настройки
    if (portfolio.positions.length > 0 && !finnhubApiKey) {
      setShowSettings(true);
      return;
    }
    refresh();
  };

  return (
    <>
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
                {lastUpdated.toLocaleTimeString(t.locale, {
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
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>

            {/* Load */}
            <button
              onClick={() => fileRef.current?.click()}
              className="h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.load}</span>
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
              <span className="hidden sm:inline">{t.save}</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`h-8 w-8 flex items-center justify-center rounded-md border transition-colors ${
                showSettings
                  ? "border-ring bg-accent text-accent-foreground"
                  : !finnhubApiKey && portfolio.positions.length > 0
                    ? "border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-accent"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
              title={t.settings}
            >
              <Settings className="h-3.5 w-3.5" />
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="h-8 w-14 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-mono font-medium transition-colors"
              title="Switch language / Сменить язык"
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              title={theme === "light" ? "Dark mode" : "Light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Settings overlay */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
