import '../Activity.css'
import { Button } from '../../../../components'
import { useState, useRef } from 'react'

const data = [
    {
        id: 1,
        title : "Readme",
        done : 0,
        description : 'faire le readme pour Minishell',
        deadline : '01/02/2026'
    },
    {
        id: 2,
        title : "Correction",
        done : 0,
        description : 'Corriger philo',
        deadline : '30/01/2026'
    },
    {
        id: 3,
        title : "Révisions",
        done : 0,
        description : "réviser l'exam",
        deadline : '01/02/2026'
    }
]

export default function ToDoListEditor(){
    const [title, setTitle]= useState('');
    const [description, setDescription]= useState('');
    const  [deadline, setDeadline] = useState('');
    const inputTitle = useRef();
    const inputDeadline = useRef();
    const inputDescription = useRef();
    const newTask = (() =>{

    })
    return <>
            <div className='todolist-editor-container'>
                <h3>   To do list editor</h3>
                <div className='todo' key='0'>
                    <h3>    Add a new task :</h3>
                    <h4> Titre</h4>
                    <input ref={inputTitle} className='input-new-todo'></input>
                    <h4> Description</h4>
                    <input ref={inputDescription} className='input-new-todo'></input>
                    <h4> Deadline</h4>
                    <input ref={inputDeadline} className='input-new-todo'></input>
                    <Button onClick={newTask} text="Add"/>
                </div>
                    {data.map((element) => (
            <div className='todo-tile-editor' key={element.id}>
                    <div className='todo-title-editor' >{element.title}</div>
                    <p className='todo-description'>Description : {element.description} </p>
                    {element.done === 1 && <p>Task completed</p>}
                </div>))}
            </div>
       </>
}