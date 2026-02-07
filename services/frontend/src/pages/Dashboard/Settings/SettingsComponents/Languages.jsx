import { useState } from 'react'
import { LogTitle, Button } from '../../../../components'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Languages () {
    const [openSection, setOpenSection] = useState(null)
    const { i18n } = useTranslation()

    const handleSection = sectionName => {
        setOpenSection(openSection === sectionName ? null : sectionName)
    }

    const changeLanguage = lang => {
        i18n.changeLanguage(lang)
        localStorage.setItem('language', lang) // optional but useful
    }

    return (
        <>
            <section onClick={() => handleSection('languagePreference')}>
                <LogTitle text="Préférence de langues" />

                <Button
                    className="btn-setting"
                    text="Choisir Français"
                    onClick={() => changeLanguage('fr')}
                />

                <Button
                    className="btn-setting"
                    text="Choisir Anglais"
                    onClick={() => changeLanguage('en')}
                />

                <Button
                    className="btn-setting"
                    text="Choisir Espagnol"
                    onClick={() => changeLanguage('es')}
                />
            </section>
        </>
    )
}
