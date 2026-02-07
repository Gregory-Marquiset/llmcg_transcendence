import { Button, SpinLogo } from '../'
import './LeftMenu.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';

export default function LeftMenu({setIsLoading}){
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
            <Button onClick={() => handleOnClick("/dashboard")} text="Mon dashboard"/>
            <Button onClick={() => handleOnClick("/dashboard/activity")} text="Mes activités" />
            <Button onClick={() => handleOnClick("/dashboard/friends")} text="Mes Amis"/>
            <Button onClick={() => handleOnClick("/dashboard/chat")} text="Messages"/>
            <Button onClick={() => handleOnClick("/dashboard/profile")} text="Mon Profil"/>
            <Button onClick={() => handleOnClick("/dashboard/settings")} text="Mes réglages"/>
            <Button onClick={() => handleOnClick("/dashboard/watchdog")} text="Watchdog" />
                <br/><br/><br/><br/>
            <SpinLogo/>
          </div>
    )
}
