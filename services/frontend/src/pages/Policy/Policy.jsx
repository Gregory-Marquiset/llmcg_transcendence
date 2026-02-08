import { HeaderBar, Background, Footer, Loading } from "../../components";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export function Policy() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleOnClick = (path) => {
        setIsLoading(true);
        setTimeout(() => {
            navigate(path);
            setIsLoading(false);
        }, 500);
    }

    if (isLoading) return <Loading duration={500} showButton={false} />

    return (
        <div className="page-wrapper">
            <HeaderBar/>
            <Background>
                <div className="policy-wrapper">
                    <h1>{t('policy.title')}</h1>
                    <br/>
                    <p>{t('policy.description')}</p>
                    <br/>
                    <button onClick={() => handleOnClick('/policy/terms')}>
                        {t('policy.terms_button')}
                    </button>
                    <button onClick={() => handleOnClick('/policy/privacy')}>
                        {t('policy.privacy_button')}
                    </button>
                </div>
            </Background>
            <Footer/>
        </div>
    );
}

export default Policy;
