import { Background, LogTitle, Button, Footer, SpinLogo } from "../../components"
import { useTranslation } from "react-i18next"

export default function Error401 () {
    const { t } = useTranslation()
    return (
    <>
        <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />

        <LogTitle text={t('errors.401.title')} />

        <br />

        <p>
            {t('errors.401.message_line_1')}
            <br />
            {t('errors.401.message_line_2')}
        </p>

        <br /><br />

        <Button text={t('errors.401.login_again')} onClick={() => navigate('/login')} />
            <SpinLogo/>
        </Background>
        <Footer />
    </>
    )

}
