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

function fmt(value: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtNum(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
    value,
  );
}

// ─── Типы сортировки ────────────────────────────────────────────────────────

type SortField = "ticker" | "action";
type SortDir = "asc" | "desc";
type Action = "buy" | "sell" | "hold";

const ACTION_ORDER: Record<Action, number> = {
  sell: 0, // при ascending — продажи идут первыми
  hold: 1,
  buy: 2,
};

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
    let cmp = 0;
    if (field === "ticker") {
      cmp = a.ticker.localeCompare(b.ticker);
    } else if (field === "action") {
      cmp = ACTION_ORDER[getAction(a.diff)] - ACTION_ORDER[getAction(b.diff)];
    }
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

// ─── Компоненты ─────────────────────────────────────────────────────────────

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

/** Иконка сортировки в заголовке колонки */
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

/** Кликабельный заголовок колонки с поддержкой сортировки */
function SortableHeader({
  field,
  sortField,
  sortDir,
  onSort,
  children,
}: {
  field: SortField;
  sortField: SortField | null;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  children: React.ReactNode;
}) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </span>
    </th>
  );
}

// ─── Предупреждение об отсутствии API ключа ──────────────────────────────────

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

  // ── Состояния загрузки ──────────────────────────────────────────────────

  if (fetchStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        {t.loadingData}
      </div>
    );
  }

  if (fetchStatus === "error") {
    if (fetchError === "NO_API_KEY") {
      return <ApiKeyBanner />;
    }
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
            {fmt(totalValueBase, baseCurrency, t.locale)}
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
                <SortableHeader
                  field="ticker"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.ticker}
                </SortableHeader>
                {[t.current, t.target, t.diff, t.amount].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <SortableHeader
                  field="action"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.action}
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {stocks.map((rec) => {
                const action = getAction(rec.diff);
                return (
                  <tr
                    key={rec.ticker}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-mono font-medium text-xs">
                      {rec.ticker}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {fmtNum(rec.currentQuantity, t.locale)} {t.pieces}
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      {fmtNum(rec.targetQuantity, t.locale)} {t.pieces}
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      <span
                        className={
                          rec.diff > 0
                            ? "text-green-600 dark:text-green-400"
                            : rec.diff < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }
                      >
                        {rec.diff > 0 ? "+" : ""}
                        {fmtNum(rec.diff, t.locale)} {t.pieces}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                      {rec.tradeValueBase !== null
                        ? fmt(
                            Math.abs(rec.tradeValueBase),
                            baseCurrency,
                            t.locale,
                          )
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {t.currency}
                </th>
                {[t.current, t.target, t.diff].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <SortableHeader
                  field="action"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                >
                  {t.action}
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {cash.map((rec) => {
                const action = getAction(rec.diff, 10);
                return (
                  <tr
                    key={rec.currency}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-mono font-medium text-xs">
                      {rec.currency}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {fmtNum(rec.currentAmount, t.locale)}
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      {fmtNum(rec.targetAmount, t.locale)}
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      <span
                        className={
                          rec.diff > 0
                            ? "text-green-600 dark:text-green-400"
                            : rec.diff < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }
                      >
                        {rec.diff > 0 ? "+" : ""}
                        {fmtNum(rec.diff, t.locale)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
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
