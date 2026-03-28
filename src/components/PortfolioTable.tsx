import { useState } from "react";
import { Trash2, Plus, Wand2, StickyNote } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { StockPositionEnriched, CashPositionEnriched } from "@/lib/types";

// ─── Форматирование ────────────────────────────────────────────────────────

function fmtCurrency(
  value: number | null,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function fmtPrice(
  value: number | null,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

/** 2 знака после запятой для точного копирования в целевой % */
function fmtPct(value: number | null): string {
  return (value ?? 0).toFixed(2) + "%";
}

// ─── Дельта ────────────────────────────────────────────────────────────────

function DeltaCell({ delta }: { delta: number | null }) {
  const val = delta ?? 0;
  const color =
    val > 0.5
      ? "text-green-600 dark:text-green-400"
      : val < -0.5
        ? "text-red-500"
        : "text-muted-foreground";
  return (
    <td className={`px-3 py-2 text-right text-xs tabular-nums ${color}`}>
      {val > 0 ? "+" : ""}
      {val.toFixed(2)}%
    </td>
  );
}

// Единый стиль инпута — заполняет ячейку целиком
const inputCls =
  "w-full h-7 px-2 text-xs tabular-nums rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring";

// ─── Строка акции ───────────────────────────────────────────────────────────

function StockRow({
  pos,
  index,
}: {
  pos: StockPositionEnriched;
  index: number;
}) {
  const [showNote, setShowNote] = useState(false);
  const { updateStock, removeStock } = usePortfolioStore();
  const baseCurrency = usePortfolioStore((s) => s.portfolio.baseCurrency);
  const { t } = useSettingsStore();

  const hasNote = Boolean(pos.note?.trim());

  /** Округляем до 2 знаков — столько же, сколько показываем */
  const handleCopyPercent = () => {
    if (pos.currentPercent == null) return;
    const rounded = Math.round(pos.currentPercent * 100) / 100;
    updateStock(index, { targetPercent: rounded });
  };

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-3 py-2">
          <input
            value={pos.ticker}
            onChange={(e) =>
              updateStock(index, { ticker: e.target.value.toUpperCase() })
            }
            placeholder="AAPL"
            className={`${inputCls} font-mono uppercase text-left`}
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={pos.quantity}
            min={0}
            step={1}
            onChange={(e) =>
              updateStock(index, { quantity: Number(e.target.value) })
            }
            className={`${inputCls} text-right`}
          />
        </td>
        <td className="px-3 py-2 text-right text-xs tabular-nums text-muted-foreground">
          {fmtPrice(pos.price, pos.currency ?? "USD", t.locale)}
        </td>
        <td className="px-3 py-2 text-right text-xs tabular-nums">
          {fmtCurrency(pos.valueBase, baseCurrency, t.locale)}
        </td>
        {/* Клик по «Факт %» переносит значение в «Цель %» */}
        <td
          className={`px-3 py-2 text-right text-xs tabular-nums ${
            pos.currentPercent != null
              ? "cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors select-none"
              : "text-muted-foreground"
          }`}
          title={pos.currentPercent != null ? t.copyPercentHint : undefined}
          onClick={handleCopyPercent}
        >
          {fmtPct(pos.currentPercent)}
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={pos.targetPercent}
            min={0}
            max={100}
            step={0.01}
            onChange={(e) =>
              updateStock(index, { targetPercent: Number(e.target.value) })
            }
            className={`${inputCls} text-right`}
          />
        </td>
        <DeltaCell delta={pos.delta} />
        <td className="px-1 py-2">
          <div className="flex items-center justify-center gap-0.5">
            <button
              onClick={() => setShowNote((v) => !v)}
              title={t.note}
              className={`h-7 w-6 inline-flex items-center justify-center rounded transition-colors ${
                hasNote
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              } ${showNote ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <StickyNote className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => removeStock(index)}
              className="h-7 w-6 inline-flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {showNote && (
        <tr className="border-b bg-muted/20">
          <td colSpan={8} className="px-3 pb-2 pt-1">
            <textarea
              value={pos.note ?? ""}
              onChange={(e) => updateStock(index, { note: e.target.value })}
              placeholder={t.notePlaceholder}
              rows={2}
              className="w-full text-xs px-2 py-1.5 rounded border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Строка кэша ────────────────────────────────────────────────────────────

function CashRow({
  pos,
  index,
  baseCurrency,
}: {
  pos: CashPositionEnriched;
  index: number;
  baseCurrency: string;
}) {
  const [showNote, setShowNote] = useState(false);
  const { updateCash, removeCash } = usePortfolioStore();
  const { t } = useSettingsStore();

  /** Позиция базовой валюты защищена от удаления */
  const isBase = pos.currency === baseCurrency;
  const hasNote = Boolean(pos.note?.trim());

  const handleCopyPercent = () => {
    if (pos.currentPercent == null) return;
    const rounded = Math.round(pos.currentPercent * 100) / 100;
    updateCash(index, { targetPercent: rounded });
  };

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-3 py-2">
          <input
            value={pos.currency}
            onChange={(e) =>
              updateCash(index, { currency: e.target.value.toUpperCase() })
            }
            placeholder="USD"
            // Базовую валюту нельзя редактировать (она управляется через селект в Header)
            readOnly={isBase}
            className={`${inputCls} font-mono uppercase text-left ${isBase ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={pos.amount}
            min={0}
            step={0.01}
            onChange={(e) =>
              updateCash(index, { amount: Number(e.target.value) })
            }
            className={`${inputCls} text-right`}
          />
        </td>
        <td className="px-3 py-2 text-right text-xs tabular-nums">
          {fmtCurrency(pos.valueBase, baseCurrency, t.locale)}
        </td>
        {/* Клик по «Факт %» переносит значение в «Цель %» */}
        <td
          className={`px-3 py-2 text-right text-xs tabular-nums ${
            pos.currentPercent != null
              ? "cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors select-none"
              : "text-muted-foreground"
          }`}
          title={pos.currentPercent != null ? t.copyPercentHint : undefined}
          onClick={handleCopyPercent}
        >
          {fmtPct(pos.currentPercent)}
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={pos.targetPercent}
            min={0}
            max={100}
            step={0.01}
            onChange={(e) =>
              updateCash(index, { targetPercent: Number(e.target.value) })
            }
            className={`${inputCls} text-right`}
          />
        </td>
        <DeltaCell delta={pos.delta} />
        <td className="px-1 py-2">
          <div className="flex items-center justify-center gap-0.5">
            <button
              onClick={() => setShowNote((v) => !v)}
              title={t.note}
              className={`h-7 w-6 inline-flex items-center justify-center rounded transition-colors ${
                hasNote
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              } ${showNote ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <StickyNote className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => removeCash(index)}
              disabled={isBase}
              className={`h-7 w-6 inline-flex items-center justify-center rounded transition-colors ${
                isBase
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-destructive/10 hover:text-destructive"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {showNote && (
        <tr className="border-b bg-muted/20">
          <td colSpan={7} className="px-3 pb-2 pt-1">
            <textarea
              value={pos.note ?? ""}
              onChange={(e) => updateCash(index, { note: e.target.value })}
              placeholder={t.notePlaceholder}
              rows={2}
              className="w-full text-xs px-2 py-1.5 rounded border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Заголовок ─────────────────────────────────────────────────────────────

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

// ─── Badge суммы целевых % ──────────────────────────────────────────────────

function TargetSumBadge({
  total,
  canAdjust,
  adjustPercent,
  onAdjust,
}: {
  total: number;
  /** Можно ли скорректировать через базовую валюту */
  canAdjust: boolean;
  /** Значение, до которого будет скорректирован % базовой валюты */
  adjustPercent: number;
  onAdjust: () => void;
}) {
  const deviation = total - 100;
  const isOk = Math.abs(deviation) < 0.01;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border tabular-nums ${
        isOk
          ? "border-green-500 text-green-600 dark:text-green-400"
          : "border-red-500 text-red-500"
      }`}
    >
      <span>Σ {total.toFixed(1)}%</span>
      {!isOk && (
        <span className="opacity-75">
          ({deviation > 0 ? "+" : ""}
          {deviation.toFixed(1)}%)
        </span>
      )}
      {/* Кнопка коррекции — показывается только когда есть отклонение и коррекция возможна */}
      {!isOk && canAdjust && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjust();
          }}
          title={`→ ${adjustPercent.toFixed(2)}%`}
          className="ml-0.5 h-4 w-4 inline-flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
        >
          <Wand2 className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

// ─── Основной компонент ──────────────────────────────────────────────────────

export function PortfolioTable() {
  const [tab, setTab] = useState<"stocks" | "cash">("stocks");
  const {
    portfolio,
    enrichedStocks,
    enrichedCash,
    addStock,
    addCash,
    rebalanceResult,
    adjustBaseCurrencyPercent,
  } = usePortfolioStore();
  const { t } = useSettingsStore();

  const totalTarget = [...portfolio.positions, ...portfolio.cash].reduce(
    (s, p) => s + p.targetPercent,
    0,
  );
  const baseCurrency = portfolio.baseCurrency;

  // Определяем, можно ли скорректировать через базовую валюту:
  // сумма ВСЕХ позиций кроме базовой валюты должна быть < 100%
  const baseCashIndex = portfolio.cash.findIndex(
    (c) => c.currency === baseCurrency,
  );
  const sumWithoutBase =
    portfolio.positions.reduce((s, p) => s + p.targetPercent, 0) +
    portfolio.cash
      .filter((_, i) => i !== baseCashIndex)
      .reduce((s, c) => s + c.targetPercent, 0);
  const adjustPercent = Math.round((100 - sumWithoutBase) * 100) / 100;
  const canAdjust = sumWithoutBase < 100 && Math.abs(totalTarget - 100) >= 0.01;

  return (
    <div className="space-y-3">
      {/* Переключатель + итого */}
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
          <TargetSumBadge
            total={totalTarget}
            canAdjust={canAdjust}
            adjustPercent={adjustPercent}
            onAdjust={adjustBaseCurrencyPercent}
          />
        </div>
      </div>

      {/* ── Таблица акций ─────────────────────────────────────────────────── */}
      {tab === "stocks" && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "52px" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/50">
                <Th>{t.ticker}</Th>
                <Th right>{t.quantity}</Th>
                <Th right>{t.price}</Th>
                <Th right>{t.value}</Th>
                {/* Подсказка в заголовке, что колонка кликабельна */}
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground cursor-default select-none">
                  <span
                    title={t.copyPercentHint}
                    className="underline decoration-dotted decoration-muted-foreground/50"
                  >
                    {t.actualPercent}
                  </span>
                </th>
                <Th right>{t.targetPercent}</Th>
                <Th right>Δ</Th>
                <th />
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

      {/* ── Таблица кэша ──────────────────────────────────────────────────── */}
      {tab === "cash" && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "52px" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/50">
                <Th>{t.currency}</Th>
                <Th right>{t.amount}</Th>
                <Th right>{t.inCurrency(baseCurrency)}</Th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground cursor-default select-none">
                  <span
                    title={t.copyPercentHint}
                    className="underline decoration-dotted decoration-muted-foreground/50"
                  >
                    {t.actualPercent}
                  </span>
                </th>
                <Th right>{t.targetPercent}</Th>
                <Th right>Δ</Th>
                <th />
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

      {/* Кнопка добавления */}
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
