import { usePortfolioStore } from "@/store/portfolioStore";
import { ArrowUpRight, ArrowDownLeft, Minus } from "lucide-react";

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtNum(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    value,
  );
}

type Action = "buy" | "sell" | "hold";

function getAction(diff: number, threshold = 0.5): Action {
  if (Math.abs(diff) < threshold) return "hold";
  return diff > 0 ? "buy" : "sell";
}

function ActionBadge({ action }: { action: Action }) {
  if (action === "hold") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        Держать
      </span>
    );
  }
  if (action === "buy") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
        <ArrowUpRight className="h-3.5 w-3.5" />
        Купить
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
      <ArrowDownLeft className="h-3.5 w-3.5" />
      Продать
    </span>
  );
}

export function RebalanceTable() {
  const { rebalanceResult, portfolio, fetchStatus, fetchError } =
    usePortfolioStore();
  const baseCurrency = portfolio.baseCurrency;

  if (fetchStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Загрузка данных...
      </div>
    );
  }

  if (fetchStatus === "error") {
    return (
      <div className="py-4 text-xs text-destructive">
        Ошибка загрузки: {fetchError}
      </div>
    );
  }

  if (!rebalanceResult) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground">
        Нажмите «Обновить» чтобы загрузить котировки
      </div>
    );
  }

  const { stocks, cash, totalValueBase } = rebalanceResult;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Итого:{" "}
        <span className="text-foreground font-medium">
          {fmt(totalValueBase, baseCurrency)}
        </span>
      </div>

      {/* Stocks */}
      {stocks.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Тикер
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Сейчас
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Целевое
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Разница
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Сумма
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Действие
                </th>
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
                      {fmtNum(rec.currentQuantity)} шт.
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      {fmtNum(rec.targetQuantity)} шт.
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
                        {fmtNum(rec.diff)} шт.
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                      {rec.tradeValueBase !== null
                        ? fmt(Math.abs(rec.tradeValueBase), baseCurrency)
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
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Валюта
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Сейчас
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Целевое
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Разница
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Действие
                </th>
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
                      {fmtNum(rec.currentAmount)}
                    </td>
                    <td className="px-3 py-2.5 text-xs tabular-nums">
                      {fmtNum(rec.targetAmount)}
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
                        {fmtNum(rec.diff)}
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
