# Portfolio Rebalancer

Одностраничное веб-приложение для управления и ребалансировки инвестиционного портфеля. Развёртывается на GitHub Pages как статический сайт без бэкенда.

## Возможности

- Загрузка и сохранение портфеля в формате JSON
- Управление позициями: акции и кэш в разных валютах
- Получение актуальных котировок через Yahoo Finance (неофициальный API)
- Конвертация валют через [frankfurter.app](https://frankfurter.app)
- Отображение текущей стоимости портфеля в базовой валюте
- Рекомендации по ребалансировке: сколько акций купить/продать, сколько кэша добавить/вывести

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

## Формат портфеля

```json
{
  "baseCurrency": "USD",
  "positions": [{ "ticker": "AAPL", "quantity": 10, "targetPercent": 25 }],
  "cash": [{ "currency": "USD", "amount": 5000, "targetPercent": 30 }]
}
```

Сумма всех `targetPercent` должна равняться 100%.

## Разработка

### Требования

- Docker
- VSCode с расширением [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Запуск

1. Клонировать репозиторий
2. Открыть в VSCode
3. **Reopen in Container**
4. В терминале контейнера:

```bash
bun run dev
```

Приложение доступно на `http://localhost:5173`.

### Сборка

```bash
bun run build
```

## Лицензия

MIT
