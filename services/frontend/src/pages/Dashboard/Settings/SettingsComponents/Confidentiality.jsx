import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle, Button } from '../../../../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useTranslation } from "react-i18next";

export default function Confidentiality ( loading){
    const { t } = useTranslation();
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
        loading(true);
        try {
            const response = await fetch('/api/v1/gdpr/me', {
                method : "POST",
                headers : {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            loading(false);
            if (!response.ok){
                console.log("error response");
                return ;
            }
            alert(t("settings_confidentiality.claim_email_sent"))
        }
        catch(err){
            console.log("ERROR : ", err);
        }
    }
    const requestDataDeletion = async () => {
        if (!accessToken)
            return;
        if (!confirm(t("settings_confidentiality.confirm_delete_message"))) {
            return;
        }

        try {
            const response = await fetch('/api/v1/gdpr/data', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                const error = await response.json();
                alert(t("settings_confidentiality.delete_error", { message: error.message }));
                return;
            }
            alert(t("settings_confidentiality.email_sent"));
            fetchHistory();
        }
        catch(err) {
            console.error("ERROR requesting data deletion:", err);
            alert(t("settings_confidentiality.request_error"));
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
            //console.log(history);
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
            <LogTitle text={t("settings_confidentiality.title")} />
                <Button className="btn-setting" onClick={requestData} text={t("settings_confidentiality.request_data")}/>
                <Button className="btn-setting" onClick={requestDataDeletion} text={t("settings_confidentiality.delete_data")}/>
                <Button className="btn-setting" onClick={updateHistoryView} text={t("settings_confidentiality.history")}/>
                {displayHistory && <pre className="json-preview" onClick={{updateHistoryView}}>
                    <strong>{t("settings_confidentiality.json_preview")} </strong><br/>
                    {JSON.stringify(history, null, 2)}
                </pre>}
        </section>
    )
}
