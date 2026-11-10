from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup
from airflow.operators.python import get_current_context

default_args = {
    'owner': 'email@example.com',  	# Владелец
    'retries': 2,			# Количество перезапусков
    'retry_delay': timedelta(minutes=5),# Интервал перезапуска
    'email': ['email@example.com'],	# Почта для оповещений
    'email_on_failure': True,		# Отправить сообщение о падении
    'email_on_retry': False,		# Отправить сообщение о перезапуске
}

def send_xcom():
    context = get_current_context()    
    ti = context["ti"]
    ti.xcom_push(key="random_number", value=5)

def get_xcom():
    context = get_current_context()    
    ti = context["ti"]
    value = ti.xcom_pull(
            task_ids=f"send_xcom",
            key="random_number",
        )
    print(value)

with DAG(

    dag_id='xcom_sample_dag',  		# Уникальное имя
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
	send_xcom = PythonOperator(

        task_id='send_xcom',			# Уникальное имя
        python_callable=send_xcom
)
	get_xcom = PythonOperator(

        task_id='get_xcom',			# Уникальное имя
        python_callable=get_xcom
)

        
	send_xcom >> get_xcom
