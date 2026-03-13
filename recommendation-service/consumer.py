# recommendation-service/consumer.py
import json
import threading
import time
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

import redis
import pika
import requests

# --- Налаштування ---
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'rabbitmq')
CATALOG_SERVICE_URL = 'http://product-catalog-service:3000'
ALERT_QUEUE = 'recommendations'
HTTP_PORT = 8000

# Скільки переглядів зберігаємо для одного юзера (TTL в секундах = 30 днів)
USER_PROFILE_TTL = 30 * 24 * 3600

redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=1, decode_responses=True)


# --- Ключі Redis ---
def key_category_scores(user_id):
    # Sorted set: category → score (кількість взаємодій юзера з цією категорією)
    return f'user:categories:{user_id}'

def key_viewed_products(user_id):
    # Set: productId-и, які юзер вже бачив у рекомендаціях
    return f'user:viewed:{user_id}'


# --- Робота з каталогом ---
def get_product_by_id(product_id):
    try:
        resp = requests.get(f'{CATALOG_SERVICE_URL}/products/{product_id}', timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f'!!! Cannot get product {product_id}: {e}')
    return None


def get_popular_in_category(category, exclude_ids: list):
    """Повертає популярні товари категорії, виключаючи вже переглянуті."""
    try:
        resp = requests.get(f'{CATALOG_SERVICE_URL}/products/popular/{category}', timeout=5)
        if resp.status_code == 200:
            products = resp.json()
            # Фільтруємо вже переглянуті цим юзером
            return [p for p in products if p['id'] not in exclude_ids]
    except Exception as e:
        print(f'!!! Cannot get popular products for "{category}": {e}')
    return []


# --- Профіль юзера в Redis ---
def update_user_profile(user_id, product_id, category):
    """Оновлюємо персональний профіль юзера на основі його дії."""
    cat_key = key_category_scores(user_id)
    viewed_key = key_viewed_products(user_id)

    # Збільшуємо рахунок категорії для цього юзера
    redis_client.zincrby(cat_key, 1, category)
    redis_client.expire(cat_key, USER_PROFILE_TTL)

    # Додаємо товар до списку переглянутих
    redis_client.sadd(viewed_key, product_id)
    redis_client.expire(viewed_key, USER_PROFILE_TTL)


def get_user_top_categories(user_id, top_n=3):
    """Повертає топ-N категорій юзера за кількістю взаємодій (найулюбленіші першими)."""
    return redis_client.zrevrange(key_category_scores(user_id), 0, top_n - 1)


def get_user_viewed_products(user_id):
    return redis_client.smembers(key_viewed_products(user_id))


# --- RabbitMQ ---
def get_rabbitmq_channel():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600)
    )
    channel = connection.channel()
    channel.queue_declare(queue=ALERT_QUEUE, durable=True)
    return connection, channel


def send_recommendation(user_id, recommended_item_name):
    try:
        connection, channel = get_rabbitmq_channel()
        message = {'userId': user_id, 'recommendedItem': recommended_item_name}
        channel.basic_publish(
            exchange='',
            routing_key=ALERT_QUEUE,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        connection.close()
        print(f'--> Sent recommendation to user {user_id}: "{recommended_item_name}"')
    except Exception as e:
        print(f'!!! RabbitMQ error: {e}')


# --- Основна логіка рекомендацій ---
def process_view_event(user_id, product_id):
    """
    Персональна рекомендація:
    1. Отримуємо категорію переглянутого товару
    2. Оновлюємо профіль юзера в Redis (категорійні вподобання)
    3. Перебираємо топ-категорії юзера (від найулюбленішої)
    4. У кожній категорії шукаємо популярний товар, якого юзер ще не бачив
    5. Надсилаємо першу знайдену рекомендацію
    """
    product = get_product_by_id(product_id)
    if not product:
        print(f'!!! Product {product_id} not found')
        return

    category = product.get('category')
    if not category:
        return

    # Оновлюємо профіль юзера
    update_user_profile(user_id, product_id, category)

    # Отримуємо вже переглянуті товари юзером
    viewed_ids = get_user_viewed_products(user_id)

    # Перебираємо топ-категорії юзера в порядку вподобань
    top_categories = get_user_top_categories(user_id, top_n=3)

    print(f'[Profile] User {user_id} top categories: {top_categories} | viewed: {len(viewed_ids)} products')

    for preferred_category in top_categories:
        candidates = get_popular_in_category(preferred_category, list(viewed_ids))
        if candidates:
            recommended = candidates[0]
            # Відзначаємо рекомендований товар як "переглянутий", щоб не повторювати
            redis_client.sadd(key_viewed_products(user_id), recommended['id'])

            source = 'favourite category' if preferred_category != category else 'same category'
            print(f'[Recommendation] User {user_id} → "{recommended["name"]}" '
                  f'(from {source} "{preferred_category}", views={recommended.get("viewCount", 0)})')

            send_recommendation(user_id, recommended['name'])
            return

    print(f'[Recommendation] No suitable recommendation found for user {user_id}')


# --- HTTP-сервер для тригерів від api-gateway ---
class TriggerHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/trigger':
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))

        user_id = body.get('userId')
        product_id = body.get('productId')

        if not user_id or not product_id:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error":"userId and productId required"}')
            return

        threading.Thread(target=process_view_event, args=(user_id, product_id), daemon=True).start()

        self.send_response(202)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status":"accepted"}')

    def log_message(self, format, *args):
        pass  # Приглушуємо HTTP-логи


def run_http_server():
    server = HTTPServer(('0.0.0.0', HTTP_PORT), TriggerHandler)
    print(f'=== HTTP trigger server listening on :{HTTP_PORT} ===')
    server.serve_forever()


if __name__ == '__main__':
    print('=== Recommendation Service Starting ===')

    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    # Чекаємо поки RabbitMQ стане доступним
    while True:
        try:
            connection, channel = get_rabbitmq_channel()
            connection.close()
            print('=== RabbitMQ connection OK ===')
            break
        except Exception as e:
            print(f'!!! RabbitMQ not ready: {e}. Retrying in 5s...')
            time.sleep(5)

    print(f'RabbitMQ: {RABBITMQ_HOST} | Redis: {REDIS_HOST} | Catalog: {CATALOG_SERVICE_URL}')
    print('=== Ready to serve recommendations ===')

    while True:
        time.sleep(60)
