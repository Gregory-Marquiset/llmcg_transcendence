import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle, Button } from '../../../../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
export default function Confidentiality (){
    const [openSection, setOpenSection] = useState(null)
    const accessToken = localStorage.getItem("access_token");
    const [displayHistory, setDisplayHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const {errStatus, setErrStatus}= useAuth();
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
    if (errStatus === 404) return <Error404/>
  if (errStatus === 401) return <Error401/>
    return( 
        <section onClick={() => handleSection('confidentiality')}>
            <LogTitle text="Confidentialité" />
                <Button className="btn-setting" onClick={requestData} text="Reclamer mes donnees"/>
                <Button className="btn-setting" text="Supprimer mes données"/>
                <Button className="btn-setting" onClick={updateHistoryView} text="Historique RGPD"/>
                {displayHistory && <pre className="json-preview" onClick={{updateHistoryView}}>
                    <strong>JSON preview : </strong><br/>
                    {JSON.stringify(history, null, 2)}
                </pre>}
        </section>
    )
}