import {
  X,
  Shield,
  TrendingUp,
  RefreshCw,
  Database,
  Search,
  BookOpen,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

// ─── Переводы (встроены прямо здесь, не в i18n — справка большая) ────────────

const HELP_CONTENT = {
  ru: {
    title: "Справка",
    sections: [
      {
        icon: "shield",
        heading: "Конфиденциальность и безопасность",
        content: [
          "Все данные хранятся только у вас на компьютере. Приложение не отправляет и не сохраняет ваши данные на каких-либо серверах.",
          "Портфель сохраняется в обычный JSON-файл на вашем диске — вы в любой момент можете открыть его текстовым редактором, перенести на другое устройство или сделать резервную копию.",
          "Единственные внешние запросы — это получение котировок акций и курсов валют. Эти запросы не содержат персональных данных.",
          "Приложение полностью бесплатно и работает в браузере без установки.",
        ],
      },
      {
        icon: "database",
        heading: "Источники данных",
        subsections: [
          {
            title: "Котировки акций — Finnhub",
            lines: [
              "Сервис finnhub.io предоставляет биржевые котировки. API-ключ обязателен (бесплатный): зарегистрируйтесь на finnhub.io, скопируйте ключ в настройках (кнопка ⚙ в верхней панели). Ключ сохраняется в ваш JSON-файл.",
              "Бесплатный тариф: до 60 запросов в минуту — достаточно для портфеля из десятков позиций.",
            ],
          },
          {
            title: "Какую цену использовать",
            lines: [
              "В настройках (⚙) вы можете выбрать один из двух режимов:",
              "Цена закрытия — официальная цена последнего торгового дня. Стабильна: не меняется в течение дня, не зависит от того, открыта ли биржа в данный момент. Подходит для большинства случаев.",
              "Последняя сделка — цена самой последней совершённой сделки. Актуальна во время торгов и при высокой волатильности, когда важно видеть текущую рыночную цену. Вне торговых часов может быть равна нулю — в этом случае приложение автоматически использует цену закрытия.",
              "Настройка сохраняется в JSON-файл вместе с портфелем и автоматически восстанавливается при загрузке.",
            ],
          },
          {
            title: "Курсы валют — Frankfurter",
            lines: [
              "Сервис frankfurter.app предоставляет официальные курсы Европейского центрального банка (ЕЦБ). API-ключ не нужен.",
              "Курсы обновляются каждый рабочий день в ~16:00 CET. Поддерживается около 30 валют.",
              "Курсы используются для пересчёта стоимости иностранных акций и кэша в базовую валюту портфеля.",
            ],
          },
        ],
      },
      {
        icon: "search",
        heading: "Как найти тикер акции",
        content: ["Тикер — это короткое буквенное обозначение акции на бирже."],
        table: [
          {
            market: "США (NYSE / NASDAQ)",
            example: "AAPL, MSFT, TSLA",
            note: "Без суффикса",
          },
          {
            market: "Германия (XETRA)",
            example: "BMW.DE, SAP.DE",
            note: "Суффикс .DE",
          },
          {
            market: "Великобритания (LSE)",
            example: "HSBA.L, BP.L",
            note: "Суффикс .L",
          },
          { market: "Япония (TSE)", example: "7203.T", note: "Суффикс .T" },
          { market: "Гонконг (HKEX)", example: "0700.HK", note: "Суффикс .HK" },
          { market: "Австралия (ASX)", example: "CBA.AX", note: "Суффикс .AX" },
          { market: "Канада (TSX)", example: "RY.TO", note: "Суффикс .TO" },
        ],
        tableNote:
          "Тикер акции можно найти на сайте вашего брокера, на Google Finance (finance.google.com) или Yahoo Finance (finance.yahoo.com) — введите название компании в поиск.",
      },
      {
        icon: "trending",
        heading: "Что такое Portfolio Drift",
        content: [
          "Drift (отклонение) — это показатель того, насколько текущее распределение активов отличается от целевого.",
          "Формула: Drift = 0.5 × Σ|текущий_% − целевой_%| для каждой позиции.",
          "Простыми словами: это доля портфеля, которую нужно переложить, чтобы привести его к целевым весам.",
        ],
        driftLevels: [
          {
            range: "< 5%",
            color: "green",
            label: "В норме",
            desc: "Портфель близок к цели, ребалансировка не нужна.",
          },
          {
            range: "5 – 10%",
            color: "yellow",
            label: "Рассмотреть",
            desc: "Небольшое отклонение. Стоит обдумать частичную ребалансировку.",
          },
          {
            range: "> 10%",
            color: "red",
            label: "Ребалансировать",
            desc: "Значительное отклонение. Рекомендуется ребалансировка.",
          },
        ],
      },
      {
        icon: "workflow",
        heading: "Как работать с приложением",
        steps: [
          {
            n: "1",
            text: "Добавьте позиции на вкладке «Акции» — введите тикер, количество и целевой процент.",
          },
          {
            n: "2",
            text: "Добавьте наличные на вкладке «Кэш» — укажите валюту, сумму и целевой процент.",
          },
          {
            n: "3",
            text: "Убедитесь, что сумма всех целевых процентов равна 100% (индикатор Σ в верхнем правом углу таблицы).",
          },
          {
            n: "4",
            text: "Введите Finnhub API-ключ в настройках (⚙) и выберите режим цены: «Цена закрытия» — для стабильного ежедневного расчёта; «Последняя сделка» — при высокой волатильности во время торгов. Затем нажмите «Обновить».",
          },
          {
            n: "5",
            text: "В таблице «Ребалансировка» вы увидите рекомендации: сколько акций купить или продать, сколько кэша добавить или вывести.",
          },
          {
            n: "6",
            text: "Логика ребалансировки: сначала выполните операции «Продать», а затем на полученные средства — «Купить». Отсортируйте таблицу по колонке «Действие», нажав на её заголовок.",
          },
          {
            n: "7",
            text: "Сохраните портфель кнопкой «Сохранить» — JSON-файл сохранится на ваш компьютер. При следующем открытии загрузите его кнопкой «Загрузить».",
          },
        ],
      },
    ],
  },
  en: {
    title: "Help",
    sections: [
      {
        icon: "shield",
        heading: "Privacy & Security",
        content: [
          "All your data is stored only on your computer. The app does not send or save your data to any servers.",
          "Your portfolio is saved as a plain JSON file on your disk — you can open it in any text editor, copy it to another device, or back it up at any time.",
          "The only external requests are fetching stock quotes and currency rates. These requests contain no personal information.",
          "The app is completely free and runs in the browser without installation.",
        ],
      },
      {
        icon: "database",
        heading: "Data Sources",
        subsections: [
          {
            title: "Stock Quotes — Finnhub",
            lines: [
              "Finnhub.io provides stock market quotes. A free API key is required: register at finnhub.io, paste the key in Settings (⚙ button in the header). The key is saved to your JSON file.",
              "Free tier: up to 60 requests per minute — enough for a portfolio with dozens of positions.",
            ],
          },
          {
            title: "Which price to use",
            lines: [
              "In Settings (⚙) you can choose between two modes:",
              "Previous close — the official closing price of the last trading day. Stable: does not change throughout the day and is available even when the market is closed. Recommended for most use cases.",
              "Last trade — the price of the most recent transaction. Useful during trading hours and in high-volatility situations when you need a real-time market price. Outside trading hours it may be zero — in that case the app automatically falls back to the previous close.",
              "This setting is saved to the JSON file along with the portfolio and restored automatically when you load it.",
            ],
          },
          {
            title: "Currency Rates — Frankfurter",
            lines: [
              "Frankfurter.app provides official European Central Bank (ECB) exchange rates. No API key needed.",
              "Rates are updated every business day at ~16:00 CET. About 30 currencies are supported.",
              "Rates are used to convert the value of foreign stocks and cash holdings into the portfolio's base currency.",
            ],
          },
        ],
      },
      {
        icon: "search",
        heading: "How to Find a Stock Ticker",
        content: [
          "A ticker is a short alphabetic symbol that identifies a stock on an exchange.",
        ],
        table: [
          {
            market: "USA (NYSE / NASDAQ)",
            example: "AAPL, MSFT, TSLA",
            note: "No suffix",
          },
          {
            market: "Germany (XETRA)",
            example: "BMW.DE, SAP.DE",
            note: ".DE suffix",
          },
          { market: "UK (LSE)", example: "HSBA.L, BP.L", note: ".L suffix" },
          { market: "Japan (TSE)", example: "7203.T", note: ".T suffix" },
          {
            market: "Hong Kong (HKEX)",
            example: "0700.HK",
            note: ".HK suffix",
          },
          { market: "Australia (ASX)", example: "CBA.AX", note: ".AX suffix" },
          { market: "Canada (TSX)", example: "RY.TO", note: ".TO suffix" },
        ],
        tableNote:
          "Find the ticker on your broker's website, or search on Google Finance (finance.google.com) or Yahoo Finance (finance.yahoo.com).",
      },
      {
        icon: "trending",
        heading: "What is Portfolio Drift",
        content: [
          "Drift measures how far your current allocation is from your target allocation.",
          "Formula: Drift = 0.5 × Σ|current_% − target_%| for each position.",
          "In plain terms: it's the share of the portfolio that needs to be moved to reach target weights.",
        ],
        driftLevels: [
          {
            range: "< 5%",
            color: "green",
            label: "Normal",
            desc: "Portfolio is close to target, no rebalancing needed.",
          },
          {
            range: "5 – 10%",
            color: "yellow",
            label: "Consider",
            desc: "Minor deviation. Consider partial rebalancing.",
          },
          {
            range: "> 10%",
            color: "red",
            label: "Rebalance",
            desc: "Significant deviation. Rebalancing is recommended.",
          },
        ],
      },
      {
        icon: "workflow",
        heading: "How to Use the App",
        steps: [
          {
            n: "1",
            text: "Add positions in the Stocks tab — enter the ticker, quantity, and target percent.",
          },
          {
            n: "2",
            text: "Add cash in the Cash tab — enter the currency, amount, and target percent.",
          },
          {
            n: "3",
            text: "Make sure all target percents sum to 100% (the Σ indicator in the top right of the table).",
          },
          {
            n: "4",
            text: "Enter your Finnhub API key in Settings (⚙) and choose a price mode: 'Previous close' for a stable daily calculation; 'Last trade' for high-volatility situations during market hours. Then click Refresh.",
          },
          {
            n: "5",
            text: "The Rebalancing table will show recommendations: how many shares to buy or sell, and how much cash to add or withdraw.",
          },
          {
            n: "6",
            text: "Rebalancing logic: execute Sell orders first, then use the proceeds to Buy. Sort the table by the Action column by clicking its header.",
          },
          {
            n: "7",
            text: "Save your portfolio with the Save button — a JSON file will be downloaded. Next time, load it with the Load button.",
          },
        ],
      },
    ],
  },
} as const;

// ─── Вспомогательные компоненты ──────────────────────────────────────────────

function SectionIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "shield":
      return <Shield className={cls} />;
    case "database":
      return <Database className={cls} />;
    case "search":
      return <Search className={cls} />;
    case "trending":
      return <TrendingUp className={cls} />;
    case "workflow":
      return <RefreshCw className={cls} />;
    default:
      return <BookOpen className={cls} />;
  }
}

const DRIFT_COLORS: Record<string, string> = {
  green:
    "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10",
  yellow:
    "border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10",
  red: "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10",
};

// ─── Основной компонент ──────────────────────────────────────────────────────

export function HelpModal({ onClose }: { onClose: () => void }) {
  const { lang } = useSettingsStore();
  const content = HELP_CONTENT[lang];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-xl border bg-background shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — фиксированный */}
        <div className="flex items-center justify-between border-b bg-background px-6 py-4 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{content.title}</span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content — скроллируемая область */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto">
          {content.sections.map((section) => (
            <section key={section.heading}>
              {/* Section heading */}
              <div className="flex items-center gap-2 mb-3">
                <SectionIcon type={section.icon} />
                <h3 className="text-sm font-semibold">{section.heading}</h3>
              </div>

              {/* Plain paragraphs */}
              {"content" in section && section.content && (
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  {section.content.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {/* Subsections (Data Sources) */}
              {"subsections" in section && section.subsections && (
                <div className="space-y-4">
                  {section.subsections.map((sub) => (
                    <div
                      key={sub.title}
                      className="rounded-lg border px-4 py-3 space-y-1.5"
                    >
                      <p className="text-xs font-medium">{sub.title}</p>
                      {sub.lines.map((line, i) => (
                        <p
                          key={i}
                          className="text-xs text-muted-foreground leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Ticker table */}
              {"table" in section && section.table && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          {lang === "ru"
                            ? ["Биржа", "Пример", "Формат"].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-2 text-left font-medium text-muted-foreground"
                                >
                                  {h}
                                </th>
                              ))
                            : ["Exchange", "Example", "Format"].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-2 text-left font-medium text-muted-foreground"
                                >
                                  {h}
                                </th>
                              ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.map((row) => (
                          <tr
                            key={row.market}
                            className="border-b last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-3 py-2 text-muted-foreground">
                              {row.market}
                            </td>
                            <td className="px-3 py-2 font-mono font-medium">
                              {row.example}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {row.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {"tableNote" in section && section.tableNote && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {section.tableNote}
                    </p>
                  )}
                </div>
              )}

              {/* Drift levels */}
              {"driftLevels" in section && section.driftLevels && (
                <div className="mt-3 space-y-2">
                  {section.driftLevels.map((level) => (
                    <div
                      key={level.range}
                      className={`flex gap-3 items-start rounded-md border px-3 py-2.5 ${DRIFT_COLORS[level.color]}`}
                    >
                      <span className="font-mono font-semibold text-xs whitespace-nowrap mt-0.5 w-16 shrink-0">
                        {level.range}
                      </span>
                      <div>
                        <span className="font-medium text-xs">
                          {level.label}
                        </span>
                        <span className="text-xs opacity-75">
                          {" "}
                          — {level.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-step workflow */}
              {"steps" in section && section.steps && (
                <ol className="space-y-2.5">
                  {section.steps.map((step) => (
                    <li
                      key={step.n}
                      className="flex gap-3 text-xs leading-relaxed"
                    >
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center font-medium shrink-0 mt-0.5 text-[10px]">
                        {step.n}
                      </span>
                      <span className="text-muted-foreground">{step.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}

          {/* Footer */}
          <div className="pt-2 border-t text-center text-[11px] text-muted-foreground">
            Portfolio Rebalancer —{" "}
            {lang === "ru"
              ? "бесплатное приложение с открытым исходным кодом"
              : "free open-source app"}
          </div>
        </div>
      </div>
    </div>
  );
}
