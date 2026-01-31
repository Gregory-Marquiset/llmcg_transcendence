import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle } from '../../../../components'
import { useState, useEffect } from 'react'

export default function Confidentiality (){
    const [openSection, setOpenSection] = useState(null)
    const [gdprUserData, setGdprUserData] = useState({});
    const accessToken = localStorage.getItem("access_token");
    const [displayGdpr, setDisplayGdpr] = useState(false);
    const handleSection = sectionName => {
        if (!displayGdpr && (openSection === sectionName))
            return ;
        setOpenSection(openSection === sectionName ? null : sectionName)
        if (openSection === null)
            setDisplayGdpr(false);
    }
    const fetchAllData = async () => {
        try {
            const response = await fetch('/api/v1/gdpr/me', {
                method : "GET",
                headers : {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok){
                console.log("error response");
                return ;
            }
            const data = await response.json();
            setGdprUserData(data);
        }
        catch(err){
            console.log("ERROR : ", err);
        }
    }
    useEffect(() => {
        if (accessToken)
            fetchAllData();
    }, []);
    const setDisplay = () => {
        if (displayGdpr)
            setDisplayGdpr(false);
        else{
            setDisplayGdpr(true);
        }
    }
    const exportUserData = () => {
        if (!gdprUserData) {
            console.log("No GDPR data to export");
            return;
        }
        const json = JSON.stringify(gdprUserData, null, 2);
        const blob = new Blob([json], {
            type: "application/json;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "personal_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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
                <button className="btn-setting" onClick={() => setDisplay(true)}>Consulter mes donnees</button>
                <button className="btn-setting" onClick={exportUserData}>Exporter mes données</button>
                <button className="btn-setting">Supprimer mes données</button>
                {displayGdpr && <pre className="json-preview">
                    {JSON.stringify(gdprUserData, null, 2)}
                </pre>
                }
                </motion.div>
            )}
            </AnimatePresence>
        </section>
    )
}