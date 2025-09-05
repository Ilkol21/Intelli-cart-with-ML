# recommendation-service/consumer.py
import json
from kafka import KafkaConsumer
import time
import os
import sys
from collections import defaultdict
import redis
import pika
import requests
from datetime import datetime, timedelta
import random

# --- Налаштування ---
KAFKA_TOPICS = ['shopping_events', 'delivery_events']
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:29092')
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
CATALOG_SERVICE_URL = "http://product-catalog-service:3000"
MEALDB_API_URL_FILTER = "https://www.themealdb.com/api/json/v1/1/filter.php"
MEALDB_API_URL_LOOKUP = "https://www.themealdb.com/api/json/v1/1/lookup.php"
ALERT_QUEUE = 'recommendations'

# --- Підключення до сервісів ---
redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=1, decode_responses=True)

def get_product_details(product_name):
    """Робить запит до product-catalog-service, щоб отримати деталі товару."""
    try:
        url = f"http://product-catalog-service:3000/products/by-name/{product_name}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except requests.RequestException as e:
        print(f"!!! Could not get product details for {product_name}: {e}")
    return None

def get_similar_products(category, exclude_id):
    """Отримує схожі товари з тієї ж категорії."""
    try:
        url = f"http://product-catalog-service:3000/products/by-category/{category}?exclude={exclude_id}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except requests.RequestException as e:
        print(f"!!! Could not get similar products for category {category}: {e}")
    return []

# ... (main_loop, але з оновленою логікою обробки)

def main_loop(consumer, producer, channel):
    print("--- Listening for messages on topic 'shopping_events' ---")

    for message in consumer:
        try:
            event = json.loads(message.value.decode('utf-8'))
            event_type = event.get('type')
            data = event.get('data')

            if event_type == 'item_added':
                user_id = data.get('userId')
                item_name = data.get('itemName')

                # --- ЛОГІКА РЕКОМЕНДАЦІЇ СХОЖИХ ТОВАРІВ ---
                product_details = get_product_details(item_name)
                if product_details:
                    category = product_details.get('category')
                    product_id = product_details.get('id')

                    similar_products = get_similar_products(category, product_id)
                    if similar_products:
                        # Відправляємо рекомендацію першого знайденого схожого товару
                        recommended_item = similar_products[0]
                        recommendation_message = {
                            'userId': user_id,
                            'type': 'similar_product',
                            'payload': {
                                'based_on': item_name,
                                'recommended': recommended_item
                            }
                        }
                        channel.basic_publish(exchange='',
                                              routing_key='recommendations',
                                              body=json.dumps(recommendation_message))
                        print(f"--> [Similar Product] Sent recommendation for user {user_id}: based on '{item_name}', recommending '{recommended_item['name']}'")

        except json.JSONDecodeError:
            print("!!! Received a message that is not valid JSON")
        except Exception as e:
            print(f"!!! An unexpected error occurred: {e}")
