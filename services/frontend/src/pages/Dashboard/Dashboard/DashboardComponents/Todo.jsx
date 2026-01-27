import { Button } from '../../../../components';
import '../Dashboard.css'
import { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom'

export default function Todo (){
    const navigate = useNavigate();
    const [todo, setTodo] = useState([]);
    const accessToken = localStorage.getItem('access_token');
    const fetchTodo = async () => {
        try{
            const response = await fetch('/api/v1/statistics/todo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok){
                console.log("error while fetchin todo");
                return ;
            }
            const hey = await response.json();
            setTodo(hey);
        }
        catch (err){
            console.error(err);
        }
    };
    useEffect(() => {
        if (accessToken)
            fetchTodo();
    }, []);
    return <>
    <div className='todo-summary'>
        <h3>   You have {todo.length} tasks</h3>
        { todo.length === 0 && <Button text="Add some" onClick={() => navigate('/dashboard/activity')}/>}
        {todo.map((element) => (
           <div className='todo' key={element.id}>
                <div className='todo-title' >{element.title}</div>
                <p className='todo-description'>Description : {element.description} </p>
                {element.done !== 1 && <div className="checkbox-wrapper-5">
                <div className="check">
                    <input id={`check-${element.id}`} type="checkbox"/>
                    <label htmlFor="check-5"></label>
                </div>
                </div>}
                {element.done === 1 && <p>Task completed</p>}
            </div>))}
    </div>
    </>
}