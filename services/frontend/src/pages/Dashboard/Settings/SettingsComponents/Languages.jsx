import { useState } from 'react'
import { LogTitle, Button } from '../../../../components'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Languages () {
    const [openSection, setOpenSection] = useState(null)
    const { t, i18n } = useTranslation()

    const handleSection = sectionName => {
        setOpenSection(openSection === sectionName ? null : sectionName)
    }

    const changeLanguage = lang => {
        i18n.changeLanguage(lang)
        localStorage.setItem('language', lang)
    }

    return (
        <>
            <section onClick={() => handleSection('languagePreference')}>
                <LogTitle text={t("settings_languages.title")} />

                <Button
                    className="btn-setting"
                    text={t("settings_languages.choose_french")}
                    onClick={() => changeLanguage('fr')}
                />

                <Button
                    className="btn-setting"
                    text={t("settings_languages.choose_english")}
                    onClick={() => changeLanguage('en')}
                />

                <Button
                    className="btn-setting"
                    text={t("settings_languages.choose_spanish")}
                    onClick={() => changeLanguage('es')}
                />
            </section>
        </>
    )
}
