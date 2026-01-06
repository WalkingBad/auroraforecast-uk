# AuroraForecast UK (SEO Site)

Статический SEO‑сайт для домена `auroraforecast.uk` на Astro.

## Быстрый старт

```bash
npm install
npm run build
npm run dev
```

## Синхронизация контента из Flutter

Скрипт `npm run sync` пытается подтянуть общие данные из Flutter‑приложения.
В этом репозитории по умолчанию синхронизация отключена.

Если нужен апдейт из монорепы, укажите путь до папки `app`:

```bash
APP_ROOT=/Volumes/SSD/Repos/aurorame/app npm run sync
```

## App Hosting (Firebase)

В репозитории есть `apphosting.yaml` с переменными окружения.
Обновите значения под новый домен и аналитику при необходимости.
Города для сайта берутся из `src/data/cities.json` (только UK).
Переменная `SITE_COUNTRY_CODES` используется для генерации legacy-редиректов (по умолчанию `GB`).

## Деплой

Короткая инструкция есть в `docs/hosting-setup.md`.

## Верификации и индексирование

- IndexNow ключ лежит в `public/88875cefd3af4ae41223ca0369010430.txt`
- Файлы верификации для GSC/Bing/Yandex добавляются отдельно (см. `docs/hosting-setup.md`)
