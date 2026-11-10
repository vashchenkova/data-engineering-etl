# Онлайн-учебник: Data Engineering ETL

Интерактивный учебник по Data Engineering ETL: от основ ETL/ELT до Airflow,
Kafka, Spark, качества данных и мониторинга - с практикой на реальных кейсах.

## Что внутри

- **10 уроков**:
  1. Введение в ETL/ELT
  2. Apache Airflow - часть 1 (+ практика 2)
  3. Apache Airflow - часть 2 (+ практика 3)
  4. Работа с источниками данных (+ практика 4)
  5. Apache Kafka (+ практика 5)
  6. Apache Spark - часть 1 (+ практика 6)
  7. Apache Spark - часть 2 (+ практика 7)
  8. Качество данных (+ практика 8)
  9. Мониторинг (+ практика 9)
  10. Итоговый проект «МегаЗвон» (зачёт)


## Прогресс студентов

Прогресс хранится в `localStorage` браузера каждого ученика (ключ
`de-etl-textbook-progress-v1`) - на сервер ничего не отправляется, учётные записи
не нужны. Ученик может сбросить прогресс кнопкой в подвале страницы.

## Структура проекта

```
data-engineering-etl/
├── index.html        - каркас страницы
├── css/style.css     - оформление
├── js/
│   ├── data.js       - метаданные курса и объединение уроков
│   ├── lessons1.js   - уроки 1-4 (теория, практика, тесты)
│   ├── lessons2.js   - уроки 5-7
│   ├── lessons3.js   - уроки 8-10
│   └── app.js        - роутер, SVG-иллюстрации, квиз, прогресс
├── files/            - заготовки для практик (DAG-и, docker-compose, CSV, ноутбуки)
│   ├── praktika-2/   - hello_dag.py, docker-compose.yml
│   ├── praktika-3/   - примеры DAG с XCom и params
│   ├── praktika-4/   - PostgreSQL-окружение, DAG IN/OUT, данные звонков
│   ├── praktika-5/   - Kafka-окружение, producer/consumer
│   ├── praktika-6…8/ - ноутбуки Spark и данные
│   └── praktika-9/   - alert.py (Telegram)
└── README.md
```


