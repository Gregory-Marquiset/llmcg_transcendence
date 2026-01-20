import '../Dashboard.css'
import { useState } from 'react';
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

export default function Todo (){
    const [nbTask, setNbTask] = useState(0);
    return <>
    <div className='todo-summary'>
        <h3>   You have {data.length} tasks</h3>
        {data.map((element) => (
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