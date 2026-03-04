import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { StockPositionEnriched, CashPositionEnriched } from "@/lib/types";

function fmt(value: number | null, currency: string, locale: string): string {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null)
    return <td className="px-3 py-2 text-xs text-muted-foreground">—</td>;
  const color =
    delta > 0.5
      ? "text-green-600 dark:text-green-400"
      : delta < -0.5
        ? "text-red-500"
        : "text-muted-foreground";
  return (
    <td className={`px-3 py-2 text-xs tabular-nums ${color}`}>
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}%
    </td>
  );
}

function StockRow({
  pos,
  index,
}: {
  pos: StockPositionEnriched;
  index: number;
}) {
  const { updateStock, removeStock } = usePortfolioStore();
  const baseCurrency = usePortfolioStore((s) => s.portfolio.baseCurrency);
  const { t } = useSettingsStore();

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2">
        <input
          value={pos.ticker}
          onChange={(e) =>
            updateStock(index, { ticker: e.target.value.toUpperCase() })
          }
          placeholder="AAPL"
          className="w-20 h-7 px-2 text-xs font-mono uppercase rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={pos.quantity || ""}
          min={0}
          onChange={(e) =>
            updateStock(index, { quantity: Number(e.target.value) })
          }
          className="w-20 h-7 px-2 text-xs tabular-nums rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
        {pos.price !== null
          ? fmt(pos.price, pos.currency ?? "USD", t.locale)
          : "—"}
      </td>
      <td className="px-3 py-2 text-xs tabular-nums">
        {fmt(pos.valueBase, baseCurrency, t.locale)}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
        {pos.currentPercent !== null
          ? `${pos.currentPercent.toFixed(1)}%`
          : "—"}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={pos.targetPercent || ""}
          min={0}
          max={100}
          step={0.1}
          onChange={(e) =>
            updateStock(index, { targetPercent: Number(e.target.value) })
          }
          className="w-16 h-7 px-2 text-xs tabular-nums rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <DeltaCell delta={pos.delta} />
      <td className="px-2 py-2">
        <button
          onClick={() => removeStock(index)}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function CashRow({
  pos,
  index,
  baseCurrency,
}: {
  pos: CashPositionEnriched;
  index: number;
  baseCurrency: string;
}) {
  const { updateCash, removeCash } = usePortfolioStore();
  const { t } = useSettingsStore();

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2">
        <input
          value={pos.currency}
          onChange={(e) =>
            updateCash(index, { currency: e.target.value.toUpperCase() })
          }
          placeholder="USD"
          className="w-20 h-7 px-2 text-xs font-mono uppercase rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={pos.amount || ""}
          min={0}
          onChange={(e) =>
            updateCash(index, { amount: Number(e.target.value) })
          }
          className="w-28 h-7 px-2 text-xs tabular-nums rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <td className="px-3 py-2 text-xs tabular-nums">
        {fmt(pos.valueBase, baseCurrency, t.locale)}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
        {pos.currentPercent !== null
          ? `${pos.currentPercent.toFixed(1)}%`
          : "—"}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={pos.targetPercent || ""}
          min={0}
          max={100}
          step={0.1}
          onChange={(e) =>
            updateCash(index, { targetPercent: Number(e.target.value) })
          }
          className="w-16 h-7 px-2 text-xs tabular-nums rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <DeltaCell delta={pos.delta} />
      <td className="px-2 py-2">
        <button
          onClick={() => removeCash(index)}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

export function PortfolioTable() {
  const [tab, setTab] = useState<"stocks" | "cash">("stocks");
  const {
    portfolio,
    enrichedStocks,
    enrichedCash,
    addStock,
    addCash,
    rebalanceResult,
  } = usePortfolioStore();
  const { t } = useSettingsStore();

  const totalTarget = [...portfolio.positions, ...portfolio.cash].reduce(
    (s, p) => s + p.targetPercent,
    0,
  );
  const targetOk = Math.abs(totalTarget - 100) < 0.01;
  const baseCurrency = portfolio.baseCurrency;

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("stocks")}
            className={`h-7 px-3 text-xs rounded-md transition-colors ${
              tab === "stocks"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.stocks} ({portfolio.positions.length})
          </button>
          <button
            onClick={() => setTab("cash")}
            className={`h-7 px-3 text-xs rounded-md transition-colors ${
              tab === "cash"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.cash} ({portfolio.cash.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {rebalanceResult && (
            <span className="text-sm font-medium tabular-nums">
              {new Intl.NumberFormat(t.locale, {
                style: "currency",
                currency: baseCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(rebalanceResult.totalValueBase)}
            </span>
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              targetOk
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-red-500 text-red-500"
            }`}
          >
            Σ {totalTarget.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stocks table */}
      {tab === "stocks" && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[
                  t.ticker,
                  t.quantity,
                  t.price,
                  t.value,
                  t.actualPercent,
                  t.targetPercent,
                  "Δ",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {enrichedStocks.map((pos, i) => (
                <StockRow key={i} pos={pos} index={i} />
              ))}
              {portfolio.positions.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-xs text-muted-foreground"
                  >
                    {t.noPositions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cash table */}
      {tab === "cash" && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[
                  t.currency,
                  t.amount,
                  t.inCurrency(baseCurrency),
                  t.actualPercent,
                  t.targetPercent,
                  "Δ",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {enrichedCash.map((pos, i) => (
                <CashRow
                  key={i}
                  pos={pos}
                  index={i}
                  baseCurrency={baseCurrency}
                />
              ))}
              {portfolio.cash.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-xs text-muted-foreground"
                  >
                    {t.noCashPositions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={tab === "stocks" ? addStock : addCash}
        className="h-7 px-3 text-xs rounded-md border border-dashed border-input hover:border-ring hover:bg-muted/50 flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        {tab === "stocks" ? t.addStock : t.addCurrency}
      </button>
    </div>
  );
}
