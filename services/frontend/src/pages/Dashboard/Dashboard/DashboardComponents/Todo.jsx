import { Button } from '../../../../components';
import '../Dashboard.css'
import { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useTranslation, Trans } from 'react-i18next'

export default function Todo (){
	const { t } = useTranslation()	
    const navigate = useNavigate();
    const [todo, setTodo] = useState([]);
    const accessToken = localStorage.getItem('access_token');
    const {errStatus, setErrStatus}= useAuth();
    const fetchTodo = async () => {
        try{
            const response = await fetch('/api/v1/statistics/todo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok){
                setErrStatus(response.status);
                console.log("error while fetchin todo");
                return ;
            }
            const data = await response.json();
            setTodo(data);
        }
        catch (err){
            console.error(err);
        }
    };
    const markAsDone = async (element) => {
        let done = true;
        if (element.done == true)
            done = false;
        try {
            const response = await fetch(`/api/v1/statistics/todo/${element.id}`, {
                method : "PATCH", 
                headers : {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({done}),
            });
            await fetchTodo();
            if (!response.ok){
                setErrStatus(response.status);
                console.error("While marking as done task");
                return ;
            }
            console.log("Task marked as done succesfully");
        }
        catch (err){
            console.error("ERROR : ", err);
        };
    };
    useEffect(() => {
        if (accessToken)
            fetchTodo();
    }, []);
    return <>
    <div className='todo-summary'>
        <h3>  <Trans i18nKey="dashboard.tasks_amount" values={{count: todo.length}}/></h3>
        { todo.length === 0 && <Button text={t("dashboard.add_task")} onClick={() => navigate('/dashboard/activity')}/>}
        {todo.map((element) => (
            <div className='todo' key={element.id}>
                <div className='todo-title' >{element.title}</div>
                <p className='todo-description'>{t("activity.description")} : {element.description} </p>
                {element.done !== 1 && <div className="checkbox-wrapper-5">
                    <div className="check" >
                        <input id={element.id} type="checkbox" checked={element.done} onChange={() => {markAsDone(element)}}/>
                        <label htmlFor={element.id} />
                    </div>
                </div>}
                {element.done === 1 && <p>{t("activity.task_completed")}</p>}
            </div>))}
    </div>
    </>
}