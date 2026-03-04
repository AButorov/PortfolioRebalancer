import { usePortfolioStore } from "@/store/portfolioStore";
import { useSettingsStore } from "@/store/settingsStore";
import { ArrowUpRight, ArrowDownLeft, Minus } from "lucide-react";

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

type Action = "buy" | "sell" | "hold";

function getAction(diff: number, threshold = 0.5): Action {
  if (Math.abs(diff) < threshold) return "hold";
  return diff > 0 ? "buy" : "sell";
}

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

export function RebalanceTable() {
  const { rebalanceResult, portfolio, fetchStatus, fetchError } =
    usePortfolioStore();
  const { t } = useSettingsStore();
  const baseCurrency = portfolio.baseCurrency;

  if (fetchStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        {t.loadingData}
      </div>
    );
  }

  if (fetchStatus === "error") {
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

  const { stocks, cash, totalValueBase, drift } = rebalanceResult;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">
          {t.total}{" "}
          <span className="text-foreground font-medium">
            {fmt(totalValueBase, baseCurrency, t.locale)}
          </span>
        </div>
        <DriftBadge drift={drift} />
      </div>

      {/* Stocks */}
      {stocks.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[
                  t.ticker,
                  t.current,
                  t.target,
                  t.diff,
                  t.amount,
                  t.action,
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
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

      {/* Cash */}
      {cash.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[t.currency, t.current, t.target, t.diff, t.action].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
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
