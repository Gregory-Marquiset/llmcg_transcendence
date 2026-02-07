import { SpinCube } from '../../../../components'
import '../Dashboard.css'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const motivationalQuotes = [
  "Small steps every day add up to big results.",
  "Discipline beats motivation.",
  "You don’t need more time, you need more focus.",
  "Start where you are. Use what you have.",
  "Done is better than perfect.",
  "Consistency creates confidence.",
  "Your future self will thank you.",
  "One focused hour is worth three distracted ones.",
  "Progress, not perfection.",
  "You are building something. Stay patient.",
  "Hard days are part of the process.",
  "Focus is a superpower.",
  "You’re closer than you think.",
  "Work quietly. Let results speak.",
  "Momentum comes from starting.",
  "Today’s effort is tomorrow’s freedom.",
  "Stop scrolling. Start building.",
  "You don’t need motivation, you need a routine.",
  "Your goals don’t care how you feel.",
  "Deep work creates real results.",
  "This is how discipline looks.",
  "You showed up. That matters.",
  "One task at a time.",
  "Make yourself proud today.",
  "No zero days.",
  "Your future is built in sessions like this.",
  "Focus now, relax later.",
  "You’re doing better than you think.",
  "Keep going. Don’t break the chain.",
  "Success loves consistency."
]

const getRandomQuote = () => {
  return motivationalQuotes[
    Math.floor(Math.random() * motivationalQuotes.length)
  ]
}
export default function MotivationBox() {
  const [quote, setQuote] = useState("")
  const { t } = useTranslation()	

  useEffect(() => {
    setQuote(getRandomQuote())
  }, [])

  return (
    <div className="friend-ranked motivation-card">
      <div className="motivation-content">
        <span className="motivation-label">{t("dashboard.motivation")}</span>
        <p className="motivation-quote">“{quote}”</p>
        <SpinCube/>
      </div>
    </div>
  )

}