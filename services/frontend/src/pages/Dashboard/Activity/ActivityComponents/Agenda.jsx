import { Calendar } from 'react-calendar'
import { useEffect, useState } from 'react'
import 'react-calendar/dist/Calendar.css'
import '../Activity.css'
import { motion, AnimatePresence } from 'framer-motion'

const toDo = [
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
    },
    {
        id: 3,
        title : "Révisions",
        done : 0,
        description : "réviser l'exam",
        deadline : '25/03/2026'
    }
]

export default function Agenda ({setIsLoading}) {
    const [date, setDate] = useState(new Date());
    const [focusDate, setFocusDate] = useState(null);
    const parseDate = (dateTarget) =>{
        const [day, month, year] = dateTarget.split('/');
        return `${year}-${month}-${day}`;
    }
    const getDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const hasTask = (dateTarget) => {
        const dateKey = getDateKey(dateTarget);
        for (let i = 0; i < toDo.length; i++){
            if (parseDate(toDo[i].deadline) === dateKey && !toDo[i].done)
                return true;
        }  
        return false;
    }

  return (
    <div>
        <div className='agenda-wrapper'>
            <div className='calendar-container'>
                <h3>Agenda</h3>
                <Calendar onChange={setDate} value={date} locale="fr-FR" minDate={new Date(2025, 11, 31)}
                    tileClassName={({ date }) => 
                        hasTask(date) ? 'has-event' : null
                    }
                    tileContent={({ date }) => 
                        hasTask(date) ? <div className="event-dot">•</div> : null
                    }
                    onClickDay={(date) => {
                        if (focusDate !== null)
                            setFocusDate(null);
                        else
                            setFocusDate(date);
                        }
                    }
                    />
                {focusDate && (
                    <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 1, y: -10 }}
                                transition={{ duration: 1 }}
                            >
                        <div className="day-details">
                            <h3> Tâches du {focusDate.toLocaleDateString('fr-FR')}</h3>
                            {toDo.filter(
                                t => parseDate(t.deadline) === getDateKey(focusDate)
                            ).length === 0 ? (
                                <h3>Rien à afficher</h3>
                            ) : (
                                toDo.filter(
                                        t => parseDate(t.deadline) === getDateKey(focusDate)
                                    ).map(t => (
                                        <div key={t.id} className="todo-tile-editor">
                                            {t.title}
                                        </div>
                                    ))
                            )}
                        </div>
                </motion.div>
            )}
            </div>
        </div>
    </div>
  );
}