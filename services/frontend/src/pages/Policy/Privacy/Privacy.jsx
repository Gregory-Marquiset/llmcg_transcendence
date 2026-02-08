import { HeaderBar, Footer, Background, Button } from "../../../components"
import '../Policy.css'
import { useNavigate } from 'react-router-dom'  
import { useTranslation } from 'react-i18next'

export function Privacy(){
    const navigate = useNavigate();
    const { t } = useTranslation();

    const PrivacyKeys = [
        "data_collection",
        "data_usage",
        "data_storage",
        "user_rights",
        "third_party_services",
        "cookies"
    ];

    return <>
        <div className="page-wrapper">
            <Background> 
                <HeaderBar/>
                <div className="content-wrapper-policy">
                    <div className="header">{t('privacy.title')}</div>
                    <div className="content">
                        <div className="date"><strong>{t('privacy.update_date')}</strong></div>
                        {PrivacyKeys.map((key) => {
                            const listItems = t(`privacy_policy.${key}.list`, { returnObjects: true });
                            return (
                                <div key={key}>
                                    <div className="category-title">{t(`privacy_policy.${key}.title`)}</div>
                                    <div className="text">{t(`privacy_policy.${key}.content`)}</div>
                                    {Array.isArray(listItems) && listItems.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <Footer/>
            </Background>
        </div>
    </>
}

export default Privacy;
