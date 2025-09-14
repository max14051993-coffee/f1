# F1/F2/F3 Schedule — GitHub Pages (static Next.js)

Показывает ближайшие квалификации и гонки F1/F2/F3, отсортированные по времени, с конвертацией в Europe/Belgrade.
Все данные читаются из `public/schedule.ics` (можно обновлять руками или GitHub Actions-джобой по крону).

## Локальный запуск
```bash
npm ci
npm run dev
# открыть http://localhost:3000
```

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
Отредактируй `public/schedule.ics` или добавь отдельный workflow, который раз в день собирает и коммитит новый файл.

## Заметки
- GitHub Pages не поддерживает SSR и API-роуты Next.js, проект собран в режиме `output: 'export'`.
- Расписание хранится в формате iCalendar (`.ics`).
