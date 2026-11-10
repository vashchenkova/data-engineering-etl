from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import pandas as pd
import os

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
        raise

def load_postgres_to_csv(file_name_out, table_name):
    """
    Функция для выгрузки данных в CSV из PostgreSQL
    """
    
    print(f"Начинаю экспорт таблицы {table_name} в {file_name_out}")
    
    try:
        # Подключаемся к PostgreSQL
        hook = PostgresHook(postgres_conn_id='postgres_default')
        
        # Формируем SQL запрос
        sql_query = f"SELECT * FROM {table_name}"
        
        print(f"SQL запрос: {sql_query}")
        
        # Выполняем запрос и получаем DataFrame
        print("Выполняем SQL запрос...")
        df = hook.get_pandas_df(sql=sql_query)
        
        if df.empty:
            print(f"Таблица {table_name} пустая или не найдена")
            return {
                'status': 'warning',
                'message': 'Таблица пустая или не найдена',
                'rows_exported': 0,
                'file_path': file_name_out
            }
        
        print(f"Получено {len(df)} строк, {len(df.columns)} колонок")
        print(f"Колонки: {list(df.columns)}")
        
        # Экспортируем в CSV
        print(f"Экспортируем в CSV: {file_name_out}")
        
        # Настройки экспорта
        df.to_csv(
            file_name_out,
            index=False,
            encoding='utf-8',
            sep=',',
            quotechar='"',
            quoting=1  # QUOTE_ALL
        )
        
        # Проверяем созданный файл
        file_size = os.path.getsize(file_name_out)
        print(f"Файл создан: {file_name_out}")
        print(f"Размер файла: {file_size} байт")
        
        # Логируем первые 3 строки для проверки
        sample = df.head(3)
        print(f"Пример данных (первые 3 строки):\n{sample}")
        
    except Exception as e:
        print(f"Ошибка при экспорте: {str(e)}")
        raise
with DAG(

    dag_id='postgresql_sample_dag',  		# Уникальное имя
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
    load_postgres_to_csv_task = PythonOperator(

        task_id='load_postgres_to_csv_task',			
        python_callable=load_postgres_to_csv,
        op_kwargs={
            'file_name_out': '{{ params.file_name_out }}',
            'table_name': '{{ params.table_name }}'
        },
)       
    load_csv_to_postgres_task >> load_postgres_to_csv_task