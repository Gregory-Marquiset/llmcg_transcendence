import '../Activity.css'
import { Button } from '../../../../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function ToDoListEditor(){
    const [title, setTitle]= useState('');
	const { t } = useTranslation()
    const [description, setDescription]= useState('');
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
            setErrStatus(response.status);
            if (!response.ok){
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
    useEffect(() => {
        if (accessToken)
            fetchTodo();
    }, []);
    const newTask = async () => {
    if (!title) {
        alert(t("activity.title_mandatory"));
        return;
    }
    try {
        const response = await fetch('/api/v1/statistics/todo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        setErrStatus(response.status);
        if (!response.ok) throw new Error('Failed to create todo');
        const data = await response.json();
        //console.log("Todo created:", data);
        setTitle('');
        setDescription('');
        await fetchTodo();
        } catch (err) {
            console.error("Error:", err);
        }
    }
    const deleteTask = async (id) => {
        if (!id){
            alert(t("activity.no_task_to_delete"));
            return ;
        }
        try {
            const response = await fetch(`/api/v1/statistics/todo/${id}`, {
                method : "DELETE",
                headers : {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok){
                setErrStatus(response.status);
                console.log("Reponse of fetch is not ok");
                return ;
            }
            console.log("The task is deleted");
            await fetchTodo();
        }
        catch (err){
            console.error("Error while deleting task : ", err);
        }
    }
    return <>
            <div className='todolist-editor-container'>
                <h3>{t("activity.editor")}</h3>
                <div className='todo' key='0'>
                    <form className='todo' onSubmit={newTask}>
                        <h3> {t("activity.new_task")}</h3>
                        <h4>{t("activity.title")}</h4>
                        <input onChange={(e) => setTitle(e.target.value)} className='input-new-todo'/>
                        <h4> {t("activity.description")}</h4>
                        <input onChange={(e) => setDescription(e.target.value)} className='input-new-todo'/>
                    <Button onClick={newTask} text="Add"/>
                   </form>
                </div>
                    {todo.map((element) => (
            <div className='todo-tile-editor' key={element.id}>
                <div className='split-todo-container'>
                    <h3>{element.title}</h3>
                    <p className='todo-description'>{t("activity.description")} : {element.description} </p>
                </div>
                <div className='delete-container'>
                    <button className='delete-todo' onClick={() => deleteTask(element.id)}>X</button>
                </div>
                    {element.done === 1 && <p>{t("activity.task_completed")}</p>}
                </div>))}
            </div>
       </>
}
