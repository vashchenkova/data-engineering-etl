from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup

default_args = {
    'owner': 'email@example.com',  	# Владелец
    'retries': 2,			# Количество перезапусков
    'retry_delay': timedelta(minutes=5),# Интервал перезапуска
    'email': ['email@example.com'],	# Почта для оповещений
    'email_on_failure': True,		# Отправить сообщение о падении
    'email_on_retry': False,		# Отправить сообщение о перезапуске
}

def hello_func():
    print("Hello from Docker!")

with DAG(

    dag_id='advanced_sample_dag',  		# Уникальное имя
    description='Ежедневный ETL-пайплайн', 	# Описание
    default_args=default_args,  		# По умолчанию для всех задач
    tags=['production', 'etl', 'daily'], 	# Тэги


    schedule_interval='0 3 * * *',  		# Каждый день в 03:00 ночи
    start_date=datetime(2026, 1, 1),		# Дата отсчета для первого запуска
    end_date=None,                  		# Бессрочно
    catchup=False,                  		# Не нагонять пропущенные интервалы
    max_active_runs=1,              		# Не более одного активного запуска
    dagrun_timeout=timedelta(hours=2), 		# Весь DAG должен уложиться в 2 часа
    is_paused_upon_creation=False  		# Сразу включен

) as dag:
	hello_task = PythonOperator(

        task_id='hello_func',			# Уникальное имя
        python_callable=hello_func,		# Запуск функции
        execution_timeout=timedelta(hours=1), 	# Вся таска должна уложиться в 1 час
        trigger_rule='all_done',		# Все предыдущие завершились
        pool='default_pool',			# Пул по умолчанию
        priority_weight=10			# Приоритет
)
	with TaskGroup("task_group") as process_group:
        	tasks = []
        	for step in range(10):
            		task = PythonOperator(
                		task_id=f"hello_{step}", 
                		python_callable=hello_func,
                		execution_timeout=timedelta(minutes=30),
            			)
            		tasks.append(task)
        
	hello_task >> process_group
