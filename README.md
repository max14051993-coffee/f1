# RaceSync — F1 / F2 / F3 / MotoGP Schedule (GitHub Pages, static Next.js)

Статический Next.js-сайт показывает ближайшие квалификации, гонки и спринты F1/F2/F3 и MotoGP с автоматической конвертацией времени в часовой пояс пользователя.
Интерфейс позволяет скрывать серии, выбирать период просмотра (24/48/72 часа, 7 или 30 дней), а данные берутся из `public/schedule.ics`, который обновляется вручную.

## Локальный запуск
```bash
npm ci
npm run dev
# открыть http://localhost:3000
```

## Тесты и проверка типов
```bash
npm test        # vitest
npx tsc --noEmit # typecheck
```

## Сборка и экспорт (статический сайт)
```bash
npm run build
# результат в ./out
```

## Деплой на GitHub Pages
1. Создай репозиторий и запушь файлы.
2. В Settings → Pages выбери **Source: GitHub Actions**.
3. Пуш в ветку `main` запустит workflow `.github/workflows/gh-pages.yml` (typecheck + тесты + сборка) и опубликует сайт; PR-ы проверяет `.github/workflows/ci.yml`.
   - Если репозиторий называется `username.github.io`, сайт будет по корню.
   - Иначе `next.config.js` автоматически добавит `basePath`.

## Обновление расписания
`public/schedule.ics` генерируется автоматически workflow `.github/workflows/update-schedule.yml` каждые 6 часов из открытых данных [sportstimes/f1](https://github.com/sportstimes/f1) (MIT, данные behind f1calendar.com): F1, F2, F3 и MotoGP. Если расписание изменилось — файл перезаписывается, коммитится ботом и сайт передеплоится.

Локально то же самое: `node scripts/update-schedule.mjs` (без зависимостей), `--check` — только проверить, изменилось ли.

Файл также можно использовать как веб-календарь: подпишите в Google/Apple Calendar на `https://<site>/schedule.ics`.

Формат SUMMARY: `СЕРИЯ | Этап | Страна | Трасса | Сессия`. Сессии практик/разминки отбрасываются — сайт показывает Qualifying / Sprint / Race.

## Заметки
- GitHub Pages не поддерживает SSR и API-роуты Next.js: проект собран в режиме `output: 'export'`.
- Расписание хранится в формате iCalendar (`.ics`).
- Скрипты в `scripts/` — одноразовые генераторы схем трасс (`data/track-layouts.json`) на Python (fastf1 / Wikimedia SVG).

## Лицензии
- Код распространяется по лицензии [MIT](./LICENSE).
- Контент (включая файлы в каталоге `public/`) распространяется по лицензии [Creative Commons Attribution 4.0 International](./LICENSE-CONTENT).
