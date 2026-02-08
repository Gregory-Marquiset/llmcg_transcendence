import { Calendar } from 'react-calendar'
import { useEffect, useState } from 'react'
import 'react-calendar/dist/Calendar.css'
import '../Activity.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
export default function Agenda ({setIsLoading}) {
    const [date, setDate] = useState(new Date());
    const { t } = useTranslation()
  return (
    <div>
        <div className='agenda-wrapper'>
            <div className='calendar-container'>
                <h3>{t("activity.agenda")}</h3>
                <Calendar value={date} locale="fr-FR" minDate={new Date(2025, 11, 31)}/>
            </div>
        </div>
    </div>
  );
}
