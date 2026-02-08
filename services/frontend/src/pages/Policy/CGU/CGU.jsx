import { Background, Button, Footer, HeaderBar } from '../../../components'
import '../Policy.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React from 'react'

export function CGU() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const CGUKeys = [
        "acceptance",
        "user_conduct",
        "account_termination",
        "intellectual_property",
        "liability_limitation",
        "terms_modification",
        "educational_project"
    ];

    return (
        <div className='page-wrapper'>
            <Background>
                <HeaderBar />
                <div className="content-wrapper-policy">
                    <div className="header">{t('cgu.title')}</div>
                    <div className="content">
                        <div className="date"><strong>{t('cgu.update_date')}</strong></div>
                        {CGUKeys.map((key) => {
                            const listItems = t(`cgu_policy.${key}.list`, { returnObjects: true });
                            return (
                                <div key={key}>
                                    <div className="category-title">{t(`cgu_policy.${key}.title`)}</div>
                                    <div className="text">{t(`cgu_policy.${key}.content`)}</div>
                                    {Array.isArray(listItems) && listItems.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </Background>
        </div>
    );
}

export default CGU;
