# recommendation-service/consumer.py
import json
from kafka import KafkaConsumer
import time
import os
import sys
from collections import defaultdict
from itertools import combinations
import redis
import pika

# --- Налаштування підключення до Redis ---
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

# --- Налаштування RabbitMQ ---
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
RECOMMENDATION_QUEUE = 'recommendations'

def send_recommendation(user_id, item_name):
    """Відправляє повідомлення з рекомендацією в RabbitMQ."""
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=RECOMMENDATION_QUEUE, durable=True)

        message = {
            'userId': user_id,
            'recommendedItem': item_name
        }

        channel.basic_publish(
            exchange='',
            routing_key=RECOMMENDATION_QUEUE,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"    [RabbitMQ] Sent recommendation '{item_name}' for user {user_id}", flush=True)
        connection.close()
    except Exception as e:
        print(f"!!! Could not send message to RabbitMQ: {e}", flush=True)

# --- ПОКРАЩЕНА ЛОГІКА РЕКОМЕНДАЦІЙ ---

def get_user_history(user_id, current_list_id):
    """Отримує всі минулі списки покупок (транзакції) для користувача з Redis."""
    user_lists_key = f"user_lists:{user_id}"
    all_list_ids = redis_client.smembers(user_lists_key)

    history = []
    for list_id in all_list_ids:
        # Не включаємо поточний список в історію для аналізу
        if list_id != current_list_id:
            list_key = f"list:{user_id}:{list_id}"
            items = list(redis_client.smembers(list_key))
            if items:
                history.append(items)
    return history

def find_frequent_itemsets(purchase_history, min_support=2):
    """Знаходить часті набори товарів (пари та трійки), які купували разом."""
    itemset_counts = defaultdict(int)
    for purchase_list in purchase_history:
        # Аналізуємо набори різного розміру, якщо список достатньо великий
        if len(purchase_list) >= 2:
            for pair in combinations(sorted(purchase_list), 2):
                itemset_counts[pair] += 1
        if len(purchase_list) >= 3:
            for triplet in combinations(sorted(purchase_list), 3):
                itemset_counts[triplet] += 1

    # Повертаємо набори, які зустрічалися достатньо часто (більше одного разу)
    frequent_itemsets = {itemset: count for itemset, count in itemset_counts.items() if count >= min_support}
    return frequent_itemsets

def generate_recommendation(user_id, list_id):
    """Генерує рекомендацію на основі ча-стих наборів товарів."""
    current_list_key = f"list:{user_id}:{list_id}"
    current_list_items = set(redis_client.smembers(current_list_key))

    if not current_list_items:
        return None

    history = get_user_history(user_id, list_id)
    if not history:
        print("    [ML Logic] Not enough historical data to generate a recommendation.", flush=True)
        return None

    frequent_itemsets = find_frequent_itemsets(history)
    if not frequent_itemsets:
        print("    [ML Logic] No frequent itemsets found in user history.", flush=True)
        return None

    print(f"    [ML Logic] Found frequent itemsets based on past lists: {frequent_itemsets}", flush=True)

    potential_recommendations = []

    # Перебираємо часті набори, починаючи з найбільших (трійки, потім пари)
    for itemset in sorted(frequent_itemsets.keys(), key=len, reverse=True):
        itemset_as_set = set(itemset)

        # Знаходимо товари з частого набору, яких немає в поточному списку
        missing_items = itemset_as_set.difference(current_list_items)

        # Якщо не вистачає лише одного товару, щоб зібрати повний набір
        if len(missing_items) == 1:
            present_items = itemset_as_set.intersection(current_list_items)
            if len(present_items) == len(itemset_as_set) - 1:
                recommendation = missing_items.pop()
                print(f"    [ML Logic] User has {present_items}, recommending '{recommendation}' from frequent set {itemset}.", flush=True)
                potential_recommendations.append(recommendation)

    # Повертаємо першу знайдену (найбільш специфічну) рекомендацію
    return potential_recommendations[0] if potential_recommendations else None

# --- Kafka Consumer (залишається без змін) ---

KAFKA_TOPIC = 'shopping_events'
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')

def create_consumer():
    for i in range(15):
        try:
            print(f"Attempting to connect to Kafka broker at {KAFKA_BROKER}... (Attempt {i+1}/15)", flush=True)
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=KAFKA_BROKER,
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                group_id='recommendation-group',
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("Kafka consumer connected successfully!", flush=True)
            return consumer
        except Exception as e:
            print(f"!!! Could not connect to Kafka: {e}", flush=True)
            if i < 14:
                print(f"Retrying in 5 seconds...", flush=True)
                time.sleep(5)
            else:
                print("!!! Max retries reached. Exiting.", flush=True)
                return None

def main():
    print("Recommendation service starting...", flush=True)
    try:
        redis_client.ping()
        print("Redis connected successfully!", flush=True)
    except Exception as e:
        print(f"!!! Could not connect to Redis: {e}", flush=True)
        sys.exit(1)

    consumer = create_consumer()
    if not consumer: sys.exit(1)

    print(f"--- Listening for messages on topic '{KAFKA_TOPIC}' ---", flush=True)
    try:
        for message in consumer:
            event = message.value
            print(f"--> Received event: {event}", flush=True)

            if event.get('type') == 'item_added':
                user_id = event['data']['userId']
                list_id = event['data']['listId']
                item_name = event['data']['itemName']

                # Оновлюємо дані в Redis
                list_key = f"list:{user_id}:{list_id}"
                user_lists_key = f"user_lists:{user_id}"

                redis_client.sadd(list_key, item_name)
                redis_client.sadd(user_lists_key, list_id)

                current_list_items = list(redis_client.smembers(list_key))
                print(f"    Processing: User {user_id} added item '{item_name}'. Current list state: {current_list_items}", flush=True)

                # Генеруємо та відправляємо рекомендацію
                recommendation = generate_recommendation(user_id, list_id)
                if recommendation:
                    send_recommendation(user_id, recommendation)

    except KeyboardInterrupt:
        print("Consumer interrupted.", flush=True)
    finally:
        consumer.close()
        print("Consumer closed.", flush=True)

if __name__ == "__main__":
    main()