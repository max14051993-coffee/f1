# F1/F2/F3 Schedule — GitHub Pages (static Next.js)

Статический Next.js-сайт показывает ближайшие квалификации и гонки F1/F2/F3 с автоматической конвертацией времени в часовой пояс пользователя.
Интерфейс позволяет скрыть серии F2/F3, выбрать период просмотра (24/48/72/168 часов или 30 дней), а данные берутся из `public/schedule.ics`, который можно обновлять вручную или GitHub Actions-скриптом по расписанию.

## Локальный запуск
```bash
npm ci
npm run dev
# открыть http://localhost:3000
```

## Настройка Firebase
Для авторизации и push-уведомлений нужны публичные ключи Firebase. Скопируй файл
`.env.local.example` в `.env.local` и заполни переменные из настроек проекта Firebase:

```bash
cp .env.local.example .env.local
# отредактируй .env.local
```

- `NEXT_PUBLIC_FIREBASE_API_KEY` и остальные `NEXT_PUBLIC_FIREBASE_*` — значения из
  раздела **Project settings → General → Your apps → Firebase SDK snippet**.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` — ключ из **Project settings → Cloud Messaging → Web configuration**.
- `NEXT_PUBLIC_FIREBASE_TOKENS_COLLECTION` (необязательно) — имя коллекции Firestore, в которой будут
  храниться выданные токены push-уведомлений. По умолчанию — `pushTokens`.

## Сборка и экспорт (статический сайт)
```bash
npm run build
# результат в ./out
```

## Деплой на GitHub Pages
1. Создай репозиторий и запушь файлы.
2. В Settings → Pages выбери **Source: GitHub Actions**.
3. Убедись, что Actions включены (репозиторий публичный или тебе разрешены Actions).
4. Пуш в ветку `main` запустит workflow `.github/workflows/gh-pages.yml` и опубликует сайт.
   - Если репозиторий называется `username.github.io`, сайт будет по корню.
   - Если `username.github.io/myrepo`, `next.config.js` автоматически добавит `basePath`.

## Обновление расписания
Отредактируй `public/schedule.ics` или добавь workflow, который раз в день собирает и коммитит новый файл расписания.

## Заметки
- GitHub Pages не поддерживает SSR и API-роуты Next.js, проект собран в режиме `output: 'export'`.
- Расписание хранится в формате iCalendar (`.ics`).

## Лицензии
- Код распространяется по лицензии [MIT](./LICENSE).
- Контент (включая файлы в каталоге `public/`) распространяется по лицензии [Creative Commons Attribution 4.0 International](./LICENSE-CONTENT).
