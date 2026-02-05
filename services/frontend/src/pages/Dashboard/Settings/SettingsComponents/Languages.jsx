import { useState } from 'react'
import { LogTitle, Button } from '../../../../components'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../../context/AuthContext'

export default function Languages () {
    const [openSection, setOpenSection] = useState(null)
    const handleSection = sectionName => {
    setOpenSection(openSection === sectionName ? null : sectionName)
    }
    return ( <>
        <section onClick={() => handleSection('languagePreference')}>
            <LogTitle text="Préférence de langues" />
                <Button className="btn-setting" text="Choisir Francais"/>
                <Button className="btn-setting" text="Choisir Anglais"/>
                <Button className="btn-setting" text="Choisir Espagnol"/>
        </section>
    </>)
}