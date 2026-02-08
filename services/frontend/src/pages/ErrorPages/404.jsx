import { Background, LogTitle, Button, Footer, SpinCube, SpinLogo } from "../../components"
import { logoheader } from "../../assets"
import { useNavigate } from 'react-router-dom'
import { useTranslation } from "react-i18next"

export default function Error404(){
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
    <>
        <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />

        <LogTitle text={t('errors.404.title')} />

        <br />

        <p>
            {t('errors.404.message_line_1')}
            <br />
            {t('errors.404.message_line_2')}
        </p>

        <br /><br />

        <Button text={t('errors.404.go_home')} onClick={() => navigate('/')} />
            <SpinLogo/>
        </Background>
        <Footer />
    </>
    )
}
