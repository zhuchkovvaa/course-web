# course-web# Enterprise Web Site

Курсовая работа по дисциплине "Основы web-программирования".  
Тема: Разработка сайта для предприятия по оказанию услуг для бизнеса "ENTERPRISE".

## Ссылки
- [Дизайн-макеты и прототипы (Figma)](https://www.figma.com/design/QIS6gIKJdGWgGT6NMrN2Pg/ENTERPRISE-info--Copy-?node-id=0-1&t=xjRXbHwcS5swrmpV-1)
- [Деплой (GitHub Pages)](ссылка появится после деплоя)

## Технологии
HTML5, CSS3, Vanilla JavaScript, JSON Server.

## Запуск проекта
1. Установите зависимости: `npm install`
2. Запустите JSON Server: `npx json-server --watch data/db.json --port 3000`
3. Откройте `html/homepage.html` в браузере (рекомендуется через Live Server).

## Структура данных
Проект использует локальный сервер JSON Server для хранения данных:
- `services`: список услуг (30+ записей)
- `users`: пользователи системы (10+ записей)
- `orders`: заявки клиентов (5+ записей)