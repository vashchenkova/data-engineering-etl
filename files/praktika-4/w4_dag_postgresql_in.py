from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
import pandas as pd
import os
import requests

default_args = {
    'owner': 'email@example.com',  	# Владелец
    'retries': 2,			# Количество перезапусков
    'retry_delay': timedelta(minutes=5),# Интервал перезапуска
    'email': ['email@example.com'],	# Почта для оповещений
    'email_on_failure': True,		# Отправить сообщение о падении
    'email_on_retry': False,		# Отправить сообщение о перезапуске
}

CSV_FILE_PATH_IN = '/opt/airflow/dags/data/in/calls_20260101.csv'
CSV_FILE_PATH_OUT = '/opt/airflow/dags/data/out/calls_20260101.csv'
TABLE_NAME = 'calls'

def send_telegram_message(message_text):
    bot_token = "<ВАШ_ТОКЕН_БОТА>"  # укажите свой токен (лучше хранить в Connections)
    chat_id = "<ВАШ_CHAT_ID>"
    message = message_text
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    response = requests.post(url, json=payload)
    return response.json()

def load_csv_to_postgres(file_name_in, table_name):
    """
    Функция для загрузки данных из CSV в PostgreSQL
    """
    try:
        # Чтение CSV файла
        df = pd.read_csv(
            file_name_in,
            encoding='utf-8',  
            delimiter=',',  
            low_memory=False
        )
        
        # Получение соединения с PostgreSQL
        postgres_hook = PostgresHook(postgres_conn_id='postgres_default')
        
        # Получение SQLAlchemy engine
        engine = postgres_hook.get_sqlalchemy_engine()

        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                call_id INTEGER NOT null,
                subscriber_id INTEGER NOT NULL,
                call_start TIMESTAMP NOT NULL,
                call_end TIMESTAMP NOT NULL,
                duration INTERVAL
            );
        """
        postgres_hook.run(create_table_sql)

        print(f"Таблица {table_name} создана или уже существует")
        
        # Загрузка данных в PostgreSQL
        df.to_sql(
            name=table_name,
            con=engine,
            if_exists='append',  
            index=False,
            method='multi'  # для ускорения загрузки
        )
        
        print(f"Успешно загружено {len(df)} строк в таблицу {table_name}")
        
    except Exception as e:
        print(f"Ошибка при загрузке данных: {str(e)}")
        send_telegram_message(f"Ошибка при загрузке данных: {str(e)}")
        raise

with DAG(

    dag_id='postgresql_sample_dag_in',  		# Уникальное имя
    description='Ежедневный ETL-пайплайн', 	# Описание
    default_args=default_args,  		# По умолчанию для всех задач
    tags=['production', 'etl', 'daily'], 	# Тэги


    schedule_interval='0 3 * * *',  		# Каждый день в 03:00 ночи
    start_date=datetime(2026, 1, 1),		# Дата отсчета для первого запуска
    end_date=None,                  		# Бессрочно
    catchup=False,                  		# Не нагонять пропущенные интервалы
    max_active_runs=1,              		# Не более одного активного запуска
    dagrun_timeout=timedelta(hours=2), 		# Весь DAG должен уложиться в 2 часа
    is_paused_upon_creation=False,  		# Сразу включен
    params={                                # Параметры по умолчанию для DAG
        'file_name_in': f'{CSV_FILE_PATH_IN}',
        'file_name_out': f'{CSV_FILE_PATH_OUT}',
        'table_name': f'{TABLE_NAME}'
    }

) as dag:
    load_csv_to_postgres_task = PythonOperator(

        task_id='load_csv_to_postgres_task',			
        python_callable=load_csv_to_postgres,
        op_kwargs={
            'file_name_in': '{{ params.file_name_in }}',
            'table_name': '{{ params.table_name }}'
        },
)
    trigger_next_dag = TriggerDagRunOperator(
        task_id='trigger_postgresql_sample_dag_out',
        trigger_dag_id='postgresql_sample_dag_out',
        conf={
            'file_name_out': '{{ params.file_name_out }}',
            'table_name': '{{ params.table_name }}'
        },
        wait_for_completion=True,  # Ждать завершения
        poke_interval=60,  # Проверять каждую минуту
    )
    load_csv_to_postgres_task >> trigger_next_dag