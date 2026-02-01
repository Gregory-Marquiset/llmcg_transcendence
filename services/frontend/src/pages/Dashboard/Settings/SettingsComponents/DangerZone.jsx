import '../Settings.css'
import { motion, AnimatePresence } from 'framer-motion'
import { LogTitle } from '../../../../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
export default function DangerZone () {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const accessToken = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const handleAccountDeletion = async () => {
        try {
            const response = await fetch ('/api/v1/gdpr/me', {
                method : "DELETE",
                headers : {
                    "Authorization" : `Bearer ${accessToken}`,
                }
            });
            if (!response.ok){
                console.log("while delete account");
                return ;
            }
            alert("Your account is successfully deleted !");
            setIsLoggedIn(false);
            localStorage.clear();
            navigate('/');
        }
        catch (err){
            console.log(err);
        }
    }
    const handleDataDeletion = async () => {
        try {
            const response = await fetch ('/api/v1/gdpr/data', {
                method : "DELETE",
                headers : {
                    "Authorization" : `Bearer ${accessToken}`,
                }
            });
            if (!response.ok){
                console.log("while deleting data");
                return ;
            }
            alert("You data are successfully deleted !");
            navigate('/dashboard');
        }
        catch (err){
            console.log(err);
        }
    }
    const [openSection, setOpenSection] = useState(null);
    const handleSection = sectionName => {
        setOpenSection(openSection === sectionName ? null : sectionName)
    }
    return (
        <section onClick={() => handleSection('dangerZone')}>
            <LogTitle text="Danger zone" />
            <AnimatePresence>
            {openSection === 'dangerZone' && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                >
                <button className="btn-setting" onClick={() => navigate('/gdpr/confirm/datadeletion')}>access</button>
                <button className="btn-setting" onClick={handleAccountDeletion}>Supprimer mon compte</button>
                <button className="btn-setting" onClick={handleDataDeletion}>Effacer mes données</button>
                </motion.div>
            )}
            </AnimatePresence>
        </section>
    )
}
