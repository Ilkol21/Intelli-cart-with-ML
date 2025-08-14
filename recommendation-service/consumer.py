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
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        print(f"    [RabbitMQ] Sent recommendation '{item_name}' for user {user_id}", flush=True)
        connection.close()
    except Exception as e:
        print(f"!!! Could not send message to RabbitMQ: {e}", flush=True)

REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

def find_frequent_pairs(history):
    pair_counts = defaultdict(int)
    if len(history) < 2: return {}
    for i in range(len(history) - 1):
        pair = tuple(sorted((history[i], history[i+1])))
        pair_counts[pair] += 1
    return {pair: count for pair, count in pair_counts.items() if count > 1}

def generate_recommendation(user_id, current_list):
    history_key = f"history:{user_id}"
    history = redis_client.lrange(history_key, 0, -1)
    if not history: return None
    frequent_pairs = find_frequent_pairs(history)
    for item in current_list:
        for pair, count in frequent_pairs.items():
            if item in pair:
                other_item = pair[0] if item == pair[1] else pair[1]
                if other_item not in current_list:
                    print(f"    [ML Logic] Found frequent pair: {pair} (seen {count} times). Recommending '{other_item}'.", flush=True)
                    return other_item
    return None

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

                history_key = f"history:{user_id}"
                list_key = f"list:{user_id}:{list_id}"
                redis_client.rpush(history_key, item_name)
                redis_client.sadd(list_key, item_name)
                current_list = list(redis_client.smembers(list_key))

                print(f"    Processing: User {user_id} added item '{item_name}'. Current list state: {current_list}", flush=True)

                recommendation = generate_recommendation(user_id, current_list)
                if recommendation:
                    send_recommendation(user_id, recommendation)

    except KeyboardInterrupt:
        print("Consumer interrupted.", flush=True)
    finally:
        consumer.close()
        print("Consumer closed.", flush=True)

if __name__ == "__main__":
    main()
