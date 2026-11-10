from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator
import requests

def send_telegram_message():
    bot_token = ""
    chat_id = ""
    message = "Задача выполнена успешно!"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    response = requests.post(url, json=payload)
    return response.json()

with DAG(
    dag_id="telegram_notification",
    start_date=datetime(2024, 1, 1),
    schedule_interval="@daily",
    catchup=False,
    tags=["notification"],
) as dag:
    
    send_message = PythonOperator(
        task_id="send_telegram_message",
        python_callable=send_telegram_message
    )

    send_message