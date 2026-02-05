import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle, Button } from '../../../../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Error404 from '../../../ErrorPages/404'
import Error401 from '../../../ErrorPages/401'

export default function DangerZone () {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const accessToken = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const {errStatus, setErrStatus}= useAuth();
    const handleDataDeletion = async () => {
        try {
            const response = await fetch ('/api/v1/gdpr/data', {
                method : "POST",
                headers : {
                    "Authorization" : `Bearer ${accessToken}`,
                }
            });
            if (!response.ok){
                console.log("while delete data");
                setErrStatus(response.status);
                return ;
            }
            alert("A confirmation mail has been sent !");
        }
        catch (err){
            console.log(err);
        }
    }
    const handleAccountDeletion = async () => {
        try {
            const response = await fetch ('/api/v1/gdpr/account', {
                method : "POST",
                headers : {
                    "Authorization" : `Bearer ${accessToken}`,
                }
            });
            if (!response.ok){
                console.log("while delete account");
                return ;
            }
            alert("A confirmation mail has been sent !");
        }
        catch (err){
            console.log(err);
        }
    }
    const [openSection, setOpenSection] = useState(null);
    const handleSection = sectionName => {
        setOpenSection(openSection === sectionName ? null : sectionName)
    }
    if (errStatus === 404) return <Error404/>
    if (errStatus === 401) return <Error401/>
    return (
        <section onClick={() => handleSection('dangerZone')}>
            <LogTitle text="Danger zone" />
                <Button className="btn-setting" onClick={handleAccountDeletion} text="Supprimer mon compte"/>
                <Button className="btn-setting" onClick={handleDataDeletion} text="Effacer mes données"/>
        </section>
    )
}
