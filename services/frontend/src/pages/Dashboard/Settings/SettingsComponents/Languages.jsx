import { useState } from 'react'
import { LogTitle } from '../../../../components'
import { motion, AnimatePresence } from 'framer-motion'

export default function Languages () {
    const [openSection, setOpenSection] = useState(null)

    const handleSection = sectionName => {
    setOpenSection(openSection === sectionName ? null : sectionName)
    }
    return ( <>
        <section onClick={() => handleSection('languagePreference')}>
            <LogTitle text="Préférence de langues" />
            <AnimatePresence>
            {openSection === 'languagePreference' && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                >
                <button className="btn-setting">Choisir Francais</button>
                <button className="btn-setting">Choisir Anglais</button>
                <button className="btn-setting">Choisir Espagnol</button>
                </motion.div>
            )}
            </AnimatePresence>
        </section>
    </>)
}