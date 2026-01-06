# AuroraForecast.uk — чеклист настройки

## 1. Firebase App Hosting
- Подключить репозиторий `WalkingBad/auroraforecast-uk`.
- Регион: `europe-west4`.
- Сборка: `npm run build` (использует `prebuild` и `npm run sync`).
- Запуск: `npm run start` (Astro preview).
- Переменные окружения берутся из `apphosting.yaml`.

## 2. Домены и DNS
- В App Hosting добавить домен `auroraforecast.uk`.
- В DNS у регистратора прописать записи, которые покажет Firebase (точные значения лучше брать из консоли).
- Дождаться статуса "Connected".

## 3. Поисковая консоль и индексирование
- Google Search Console: добавить домен `auroraforecast.uk`, подтвердить через DNS.
- Добавить `PUBLIC_GSC_VERIFICATION_CODE` в App Hosting (или в `apphosting.yaml` позже).
- Обновить sitemap URL: `https://auroraforecast.uk/sitemap.xml`.

## 4. IndexNow
- Ключ находится в `public/88875cefd3af4ae41223ca0369010430.txt`.
- Обновить серверный whitelist доменов и `INDEXNOW_KEY`/`INDEXNOW_KEY_LOCATION` в функции индексирования (в репо `aurorame`).

## 5. API и CORS
- API берется с `https://europe-west1-aurorame-621f6.cloudfunctions.net`.
- В CORS / CSP нужно добавить `https://auroraforecast.uk` (в репо `aurorame`).

## 6. Аналитика
- Создать отдельный GA4 property для UK.
- Обновить `PUBLIC_GA_TRACKING_ID` в `apphosting.yaml`.

## 7. Деплой (App Hosting)
Короткий чеклист релиза:

1) Проверить сборку локально:
```bash
npm run build
```

2) Закоммитить и запушить изменения:
```bash
git status -sb
git add -A
git commit -m "your message"
git push
```

3) Запустить rollout через Firebase CLI (рекомендуется закреплять конкретный commit):
```bash
firebase apphosting:rollouts:create auroraforecast-uk \
  --project auroraforecast-uk \
  --git-commit <SHA> \
  --force
```

Альтернатива — деплой по ветке:
```bash
firebase apphosting:rollouts:create auroraforecast-uk \
  --project auroraforecast-uk \
  --git-branch main \
  --force
```

4) Проверить статус rollout:
- Консоль: https://console.firebase.google.com/project/auroraforecast-uk/apphosting
- Логи Cloud Build доступны из карточки rollout.

Если CLI ругается на активный проект:
```bash
firebase projects:list
firebase use --add
```
