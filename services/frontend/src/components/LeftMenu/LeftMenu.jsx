import { Button, SpinLogo } from '../'
import './LeftMenu.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useTranslation } from 'react-i18next'

export default function LeftMenu({setIsLoading}){
    const navigate = useNavigate();
    const { t } = useTranslation()
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
            <Button onClick={() => handleOnClick("/dashboard")} text={t('sidebar.dashboard')}/>
            <Button onClick={() => handleOnClick("/dashboard/activity")} text={t('sidebar.activity')} />
            <Button onClick={() => handleOnClick("/dashboard/friends")} text={t('sidebar.friend')}/>
            <Button onClick={() => handleOnClick("/dashboard/chat")} text={t('sidebar.conv')}/>
            <Button onClick={() => handleOnClick("/dashboard/profile")} text={t('sidebar.profile')}/>
            <Button onClick={() => handleOnClick("/dashboard/settings")} text={t('sidebar.settings')}/>
            <Button onClick={() => handleOnClick("/dashboard/watchdog")} text={t('sidebar.watchdog')} />
                
            <div className="left-menu-logo">
                <br/><br/><br/><br/>
                <SpinLogo/>
            </div>
          </div>
    )
}
