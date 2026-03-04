# Portfolio Rebalancer

Одностраничное веб-приложение для управления и ребалансировки инвестиционного портфеля. Развёртывается на GitHub Pages как статический сайт без бэкенда.

## Возможности

- Загрузка и сохранение портфеля в формате JSON
- Управление позициями: акции и кэш в разных валютах
- Получение актуальных котировок через [Finnhub.io](https://finnhub.io) (бесплатный API)
- Конвертация валют через [frankfurter.app](https://frankfurter.app) (курсы ЕЦБ)
- Отображение текущей стоимости портфеля в базовой валюте
- Рекомендации по ребалансировке: сколько акций купить/продать, сколько кэша добавить/вывести
- Показатель Portfolio Drift — интегральная оценка отклонения портфеля от целевых весов

## Стек

| Инструмент            | Назначение                         |
| --------------------- | ---------------------------------- |
| Bun                   | Runtime, пакетный менеджер, сборка |
| React 18 + TypeScript | UI                                 |
| Vite                  | Dev-сервер и бандлер               |
| Tailwind CSS v4       | Стили                              |
| shadcn/ui             | UI-компоненты                      |
| Zustand               | Управление состоянием              |
| Recharts              | Графики                            |
| lucide-react          | Иконки                             |

## Источники данных

| Сервис                                     | Данные                           | Ограничения                                  |
| ------------------------------------------ | -------------------------------- | -------------------------------------------- |
| [Finnhub.io](https://finnhub.io)           | Котировки акций (previous close) | 60 запросов/мин, требует бесплатный API-ключ |
| [frankfurter.app](https://frankfurter.app) | Курсы валют (ЕЦБ)                | ~33 валюты, RUB не поддерживается с 2022     |

## Настройка

### API-ключ Finnhub

1. Зарегистрироваться на [finnhub.io](https://finnhub.io)
2. Скопировать API Key из Dashboard
3. Создать файл `.env` в корне проекта:

```
VITE_FINNHUB_API_KEY=your_key_here
```

### Формат тикеров

| Ввод                 | Биржа         | Валюта |
| -------------------- | ------------- | ------ |
| `AAPL`, `MSFT`, `MU` | NASDAQ / NYSE | USD    |
| `BMW.DE`             | XETRA         | EUR    |
| `VOD.L`              | LSE           | GBP    |
| `7203.T`             | TSE (Tokyo)   | JPY    |

## Формат портфеля (JSON)

```json
{
  "baseCurrency": "USD",
  "positions": [{ "ticker": "AAPL", "quantity": 10, "targetPercent": 25 }],
  "cash": [{ "currency": "USD", "amount": 5000, "targetPercent": 30 }]
}
```

Сумма всех `targetPercent` должна равняться 100%.

## Portfolio Drift

Интегральный показатель отклонения портфеля от целевых весов:

```
Drift = 0.5 × Σ |currentPercent[i] − targetPercent[i]|
```

Показывает, какую долю портфеля нужно переложить для достижения цели.

| Значение | Интерпретация                    |
| -------- | -------------------------------- |
| < 5%     | В норме, ребалансировка не нужна |
| 5–10%    | Стоит рассмотреть ребалансировку |
| > 10%    | Ребалансировка оправдана         |

## Разработка

### Требования

- Docker
- VSCode с расширением [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Запуск

```bash
# 1. Клонировать репозиторий и открыть в VSCode
# 2. Reopen in Container
# 3. В терминале контейнера:
bun run dev
```

Приложение доступно на `http://localhost:5173`.

### Сборка

```bash
bun run build
```

## Структура проекта

```
src/
├── components/
│   ├── ui/                  # shadcn/ui (сгенерировано)
│   ├── Header.tsx
│   ├── PortfolioTable.tsx
│   ├── RebalanceTable.tsx
│   └── PortfolioChart.tsx
├── store/
│   └── portfolioStore.ts    # Zustand
├── services/
│   ├── finnhub.ts           # котировки акций (Finnhub.io)
│   └── frankfurter.ts       # курсы валют (ECB / frankfurter.app)
├── lib/
│   ├── rebalance.ts         # логика ребалансировки + Portfolio Drift
│   ├── utils.ts             # shadcn утилиты
│   └── types.ts             # TypeScript типы
├── App.tsx
└── main.tsx
```

## Лицензия

MIT
