import { Button } from '../'
import './LeftMenu.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';

export default function LeftMenu({ setIsLoading }) {
  const navigate = useNavigate();
  const [hide, setHide] = useState(false);

  const handleOnClick = (path) => {
    setIsLoading(true);
    setHide(true);
    setTimeout(() => {
      setIsLoading(false);
      setHide(false);
      navigate(path);
    }, 400);
  }

  if (hide) return <></>

  return (
    <div className="left-menu">
      <Button onClick={() => handleOnClick("/dashboard/activity")} text="Mes activités" />
      <Button onClick={() => handleOnClick("/dashboard/achievement")} text="Mes achievements" />
      <Button onClick={() => handleOnClick("/dashboard/conversations")} text="Mes Conversations" />
      <Button onClick={() => handleOnClick("/dashboard/ressources")} text="Mes ressources" />
      <Button onClick={() => handleOnClick("/dashboard/exportdata")} text="Exporter mes data" />
      <Button onClick={() => handleOnClick("/dashboard/friends")} text="Mes Amis" />
      <Button onClick={() => handleOnClick("/dashboard/about")} text="A propos" />

      {/* NEW */}
      <Button onClick={() => handleOnClick("/dashboard/watchdog")} text="Watchdog" />
    </div>
  )
}
