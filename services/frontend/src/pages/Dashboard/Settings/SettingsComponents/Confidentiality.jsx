import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle } from '../../../../components'
import { useState, useEffect } from 'react'

export default function Confidentiality (){
    const [openSection, setOpenSection] = useState(null)
    const accessToken = localStorage.getItem("access_token");
    const handleSection = sectionName => {
        setOpenSection(openSection === sectionName ? null : sectionName)
    }
    const requestData = async () => {
        if (!accessToken)
            return;
        try {
            const response = await fetch('/api/v1/gdpr/me', {
                method : "POST",
                headers : {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok){
                console.log("error response");
                return ;
            }
            alert("A mail has been sent !")
        }
        catch(err){
            console.log("ERROR : ", err);
        }
    }
    return( 
        <section onClick={() => handleSection('confidentiality')}>
            <LogTitle text="Confidentialité" />
            <AnimatePresence>
            {openSection === 'confidentiality' && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                >
                <button className="btn-setting" onClick={requestData}>Reclamer mes donnees</button>
                <button className="btn-setting">Supprimer mes données</button>
                </motion.div>
            )}
            </AnimatePresence>
        </section>
    )
}