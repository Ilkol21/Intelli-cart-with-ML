#!/bin/bash
# Скрипт для заповнення БД тестовими товарами і перевірки рекомендаційної системи
# Запуск: bash seed-and-test.sh

set -e

# Знайти назву контейнера PostgreSQL
PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'postgres|pg' | head -1)
if [ -z "$PG_CONTAINER" ]; then
    echo "❌ Postgres контейнер не знайдено. Запустіть: docker compose up -d"
    exit 1
fi
echo "✅ Знайдено Postgres контейнер: $PG_CONTAINER"

# Seed products
echo "📦 Заповнюємо базу тестовими товарами..."
docker exec -i "$PG_CONTAINER" psql -U user -d catalog_db < seed-products.sql
echo "✅ Товари додано!"

echo ""
echo "📋 Перевірка доступних ендпоінтів recommendation системи:"

# Перевірити by-name
echo ""
echo "1) GET /products/by-name/Молоко 2.5%"
curl -s "http://localhost:8080/api/products/by-category/Молочні%20продукти" | python3 -m json.tool 2>/dev/null | head -20 || \
    echo "   (сервіс не відповідає — переконайтесь що docker compose запущено)"

echo ""
echo "2) GET /api/products/by-category/Молочні продукти"
curl -s "http://localhost:8080/api/products/by-category/Молочні%20продукти" | python3 -m json.tool 2>/dev/null | head -20 || \
    echo "   (сервіс не відповідає)"

echo ""
echo "3) GET /api/products/info?name=Кефір 1%"
curl -s "http://localhost:8080/api/products/info?name=Кефір%201%25" | python3 -m json.tool 2>/dev/null || \
    echo "   (сервіс не відповідає)"

echo ""
echo "🧪 Симуляція Kafka-події item_added для тестування рекомендацій:"
echo "   (публікуємо подію в Kafka топік shopping_events)"

# Знайти Kafka контейнер
KAFKA_CONTAINER=$(docker ps --format '{{.Names}}' | grep kafka | grep -v zookeeper | head -1)
if [ -n "$KAFKA_CONTAINER" ]; then
    TEST_EVENT='{"type":"item_added","data":{"userId":"1","itemName":"Молоко 2.5%"}}'
    echo "$TEST_EVENT" | docker exec -i "$KAFKA_CONTAINER" \
        kafka-console-producer.sh --broker-list localhost:9092 --topic shopping_events 2>/dev/null && \
        echo "✅ Подія відправлена в Kafka!" || \
        echo "⚠️  Не вдалось відправити подію (перевірте Kafka)"
else
    echo "⚠️  Kafka контейнер не знайдено"
fi

echo ""
echo "=== Готово ==="
echo "Відкрийте http://localhost:8080 та додайте товар в кошик."
echo "Рекомендація має з'явитись на сторінці каталогу/чекауту."
