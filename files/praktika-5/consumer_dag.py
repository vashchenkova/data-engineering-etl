from airflow import DAG
from airflow.operators.python import PythonOperator
from confluent_kafka import Consumer
from datetime import datetime

def simple_kafka_read():
    """Простое чтение из Kafka"""
    consumer = Consumer({
        'bootstrap.servers': 'kafka:9092',
        'group.id': 'simple-' + datetime.now().strftime('%H%M%S'),
        'auto.offset.reset': 'earliest',
    })
    
    consumer.subscribe(['user_events'])
    
    # Ждем одно сообщение 5 секунд
    msg = consumer.poll(5.0)
    
    if msg is None:
        print("⏳ Сообщений нет")
    elif msg.error():
        print(f"❌ Ошибка: {msg.error()}")
    else:
        print(f"✅ Получено: {msg.value()}")
    
    consumer.close()

with DAG('simple_kafka', start_date=datetime.now(), schedule=None) as dag:
    PythonOperator(task_id='read', python_callable=simple_kafka_read)