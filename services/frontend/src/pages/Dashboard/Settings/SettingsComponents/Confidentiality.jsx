import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle } from '../../../../components'
import { useState, useEffect } from 'react'

export default function Confidentiality (){
    const [openSection, setOpenSection] = useState(null)
    const accessToken = localStorage.getItem("access_token");
    const [displayHistory, setDisplayHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const handleSection = sectionName => {
        if (!displayHistory && openSection === 'confidentiality' ){
            setOpenSection(sectionName);
            setDisplayHistory(false);
        }
        if (displayHistory && openSection !== 'confidentiality' && sectionName === 'confidentiality'){
            setOpenSection(null);
            setDisplayHistory(false);
        }

        setOpenSection(openSection === sectionName ? null : sectionName)
    }
    const updateHistoryView = (e) => {
        e.stopPropagation();
        if (!displayHistory){
            setDisplayHistory(true);
        }
        else
            setDisplayHistory(false);
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
    const fetchHistory = async () => {
        try {
            const response = await fetch ('/api/v1/gdpr/history', {
                method : "GET",
                headers : {
                    'Authorization' : `Bearer ${accessToken}`,
                }
            });
            if (!response.ok){
                console.log("While fetching history");
                return;
            }
            const data = await response.json();
            setHistory(data);
            console.log(history);
        }
        catch(err){
            console.log(err);
        }
    }
    useEffect(() => {
        if (accessToken)
            fetchHistory();
    }, []);
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
                <button className="btn-setting" onClick={updateHistoryView}>Historique RGPD</button>
                {displayHistory && <pre className="json-preview" onClick={{updateHistoryView}}>
                    <strong>JSON preview : </strong><br/>
                    {JSON.stringify(history, null, 2)}
                </pre>}
                </motion.div>
            )}
            </AnimatePresence>
        </section>
    )
}