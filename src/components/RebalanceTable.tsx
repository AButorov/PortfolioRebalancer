import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  KeyRound,
} from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { StockRecommendation, CashRecommendation } from "@/lib/types";

// ─── Форматирование ────────────────────────────────────────────────────────

/** Сумма сделки в базовой валюте — без копеек */
function fmtCurrency(value: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Количество акций / сумма кэша — всегда 2 знака */
function fmtQty(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Сортировка ─────────────────────────────────────────────────────────────

type SortField = "ticker" | "action";
type SortDir = "asc" | "desc";
type Action = "buy" | "sell" | "hold";

/** При ascending: сначала Продать → Держать → Купить */
const ACTION_ORDER: Record<Action, number> = { sell: 0, hold: 1, buy: 2 };

function getAction(diff: number, threshold = 0.5): Action {
  if (Math.abs(diff) < threshold) return "hold";
  return diff > 0 ? "buy" : "sell";
}

function sortStocks(
  stocks: StockRecommendation[],
  field: SortField | null,
  dir: SortDir,
): StockRecommendation[] {
  if (!field) return stocks;
  return [...stocks].sort((a, b) => {
    const cmp =
      field === "ticker"
        ? a.ticker.localeCompare(b.ticker)
        : ACTION_ORDER[getAction(a.diff)] - ACTION_ORDER[getAction(b.diff)];
    return dir === "asc" ? cmp : -cmp;
  });
}

function sortCash(
  cash: CashRecommendation[],
  field: SortField | null,
  dir: SortDir,
): CashRecommendation[] {
  if (field !== "action") return cash;
  return [...cash].sort((a, b) => {
    const cmp =
      ACTION_ORDER[getAction(a.diff, 10)] - ACTION_ORDER[getAction(b.diff, 10)];
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function ActionBadge({ action }: { action: Action }) {
  const { t } = useSettingsStore();
  if (action === "hold") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        {t.hold}
      </span>
    );
  }
  if (action === "buy") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {t.buy}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
      <ArrowDownLeft className="h-3.5 w-3.5" />
      {t.sell}
    </span>
  );
}

function DriftBadge({ drift }: { drift: number }) {
  const { t } = useSettingsStore();
  const color =
    drift < 5
      ? "border-green-500 text-green-600 dark:text-green-400"
      : drift < 10
        ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
        : "border-red-500 text-red-500";
  const label =
    drift < 5 ? t.driftNormal : drift < 10 ? t.driftConsider : t.driftRebalance;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${color}`}
      title={t.driftTitle}
    >
      <span className="tabular-nums font-medium">
        Drift {drift.toFixed(1)}%
      </span>
      <span className="opacity-60">{label}</span>
    </span>
  );
}

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField | null;
  sortDir: SortDir;
}) {
  if (sortField !== field)
    return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === "asc" ? (
    <ChevronUp className="h-3 w-3" />
  ) : (
    <ChevronDown className="h-3 w-3" />
  );
}

/** Обычный заголовок */
function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-3 py-2 text-xs font-medium text-muted-foreground ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

/** Сортируемый заголовок */
function SortableTh({
  field,
  sortField,
  sortDir,
  onSort,
  right,
  children,
}: {
  field: SortField;
  sortField: SortField | null;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  right?: boolean;
  children: React.ReactNode;
}) {
  return (
    <th
      className={`px-3 py-2 text-xs font-medium text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors ${right ? "text-right" : "text-left"}`}
      onClick={() => onSort(field)}
    >
      <span
        className={`inline-flex items-center gap-1 ${right ? "flex-row-reverse" : ""}`}
      >
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </span>
    </th>
  );
}

function ApiKeyBanner() {
  const { t } = useSettingsStore();
  return (
    <div className="rounded-md border border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-3 text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-medium text-yellow-700 dark:text-yellow-400">
        <KeyRound className="h-3.5 w-3.5" />
        {t.apiKeyWarningTitle}
      </div>
      <p className="text-muted-foreground leading-relaxed">
        {t.apiKeyWarningBody}
      </p>
    </div>
  );
}

// ─── Основной компонент ──────────────────────────────────────────────────────

export function RebalanceTable() {
  const { rebalanceResult, portfolio, fetchStatus, fetchError } =
    usePortfolioStore();
  const { t } = useSettingsStore();
  const baseCurrency = portfolio.baseCurrency;

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  if (fetchStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        {t.loadingData}
      </div>
    );
  }

  if (fetchStatus === "error") {
    if (fetchError === "NO_API_KEY") return <ApiKeyBanner />;
    return (
      <div className="py-4 text-xs text-destructive">
        {t.loadError} {fetchError}
      </div>
    );
  }

  if (!rebalanceResult) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground">
        {t.clickRefreshHint}
      </div>
    );
  }

  const { totalValueBase, drift } = rebalanceResult;
  const stocks = sortStocks(rebalanceResult.stocks, sortField, sortDir);
  const cash = sortCash(rebalanceResult.cash, sortField, sortDir);

  return (
    <div className="space-y-4">
      {/* Итого + дрейф */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">
          {t.total}{" "}
          <span className="text-foreground font-medium">
            {fmtCurrency(totalValueBase, baseCurrency, t.locale)}
          </span>
        </div>
        <DriftBadge drift={drift} />
      </div>

      {/* Таблица акций */}
      {stocks.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <SortableTh
                  field="ticker"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.ticker}
                </SortableTh>
                <Th right>{t.current}</Th>
                <Th right>{t.target}</Th>
                <Th right>{t.diff}</Th>
                <Th right>{t.amount}</Th>
                <SortableTh
                  field="action"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.action}
                </SortableTh>
              </tr>
            </thead>
            <tbody>
              {stocks.map((rec) => {
                const action = getAction(rec.diff);
                const diffColor =
                  rec.diff > 0
                    ? "text-green-600 dark:text-green-400"
                    : rec.diff < 0
                      ? "text-red-500"
                      : "text-muted-foreground";
                return (
                  <tr
                    key={rec.ticker}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-left font-mono font-medium text-xs">
                      {rec.ticker}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {fmtQty(rec.currentQuantity, t.locale)} {t.pieces}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums">
                      {fmtQty(rec.targetQuantity, t.locale)} {t.pieces}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right text-xs tabular-nums ${diffColor}`}
                    >
                      {rec.diff > 0 ? "+" : ""}
                      {fmtQty(rec.diff, t.locale)} {t.pieces}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {fmtCurrency(
                        Math.abs(rec.tradeValueBase ?? 0),
                        baseCurrency,
                        t.locale,
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-left">
                      <ActionBadge action={action} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Таблица кэша */}
      {cash.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <Th>{t.currency}</Th>
                <Th right>{t.current}</Th>
                <Th right>{t.target}</Th>
                <Th right>{t.diff}</Th>
                <SortableTh
                  field="action"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.action}
                </SortableTh>
              </tr>
            </thead>
            <tbody>
              {cash.map((rec) => {
                const action = getAction(rec.diff, 10);
                const diffColor =
                  rec.diff > 0
                    ? "text-green-600 dark:text-green-400"
                    : rec.diff < 0
                      ? "text-red-500"
                      : "text-muted-foreground";
                return (
                  <tr
                    key={rec.currency}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-left font-mono font-medium text-xs">
                      {rec.currency}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {fmtQty(rec.currentAmount, t.locale)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums">
                      {fmtQty(rec.targetAmount, t.locale)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right text-xs tabular-nums ${diffColor}`}
                    >
                      {rec.diff > 0 ? "+" : ""}
                      {fmtQty(rec.diff, t.locale)}
                    </td>
                    <td className="px-3 py-2.5 text-left">
                      <ActionBadge action={action} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
