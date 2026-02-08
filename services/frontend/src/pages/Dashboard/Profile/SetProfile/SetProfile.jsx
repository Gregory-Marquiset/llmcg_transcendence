import { useNavigate } from "react-router-dom"
import { Background, HeaderBar, Button, Loading } from "../../../../components";
import './SetProfile.css'
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useTranslation } from "react-i18next";

function SetProfile(){
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [newAvatar, setNewAvatar] = useState();
    const [newName, setNewName] = useState();
    const [newEmail, setNewEmail] = useState();
    useAuth();
    const accessToken = localStorage.getItem('access_token')
    const [loading, setLoading] = useState(false);
    const {errStatus, setErrStatus}= useAuth();
    const handleAvatarModification = async ( event ) => {
        setLoading(true);
        event.preventDefault();
        if (!newAvatar){
            alert(t('profile_settings.alerts.no_image'));
            return ;
        }
        
        console.log('Fichier sélectionné:', newAvatar.name, newAvatar.size); // ← Debug
        
        try{
            const formData = new FormData();
            formData.append('avatar', newAvatar);
            const response = await fetch('/api/v1/users/user/me/avatar', {
                method : 'PUT',
                headers : {
                    'Authorization' : `Bearer ${accessToken}`
                },
                body : formData
            });
            
            console.log('Response status:', response.status); // ← Debug
            console.log('Response:', await response.text()); // ← Debug
            
            if (!response.ok){
                alert(t('profile_settings.alerts.avatar_too_large'));
                return ;
            }
            setTimeout(() => {
                alert(t('profile_settings.alerts.avatar_success')),
                setLoading(false),
                navigate('/dashboard/profile')},
            1000);
        } catch (err) {
            console.error('Erreur complète:', err); // ← Debug
            alert(err);
            setLoading(false); // ← N'oublie pas ça !
        }
    }
    const handleEmailModification = async ( event ) => {
        event.preventDefault();
        setLoading(true);
        try {
            const pathData = await fetch('/api/v1/users/user/me', {
                method : 'PATCH',
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    new_email : newEmail
                })
            });
            if (!pathData.ok){
                console.error("Error while patching email");
                return ;
            }
            else{
                setTimeout(()=>{
                    setLoading(false),
                navigate('/dashboard/profile')
                }, 1000);
            }
        }
        catch (err){
            console.error("Fetch error :", err);
        }
    }

    const handleNameModification = async ( event ) => {
        event.preventDefault();
        setLoading(true);
        try{
            const patchData = await fetch('/api/v1/users/user/me', {
                method : 'PATCH',
                headers :{
                    'Content-type' : 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    new_username : newName
                })
            });
            if (!patchData.ok){
                console.error("Error while patching username");
                return ;
            }
            else {
                setTimeout(()=>{
                    setLoading(false),
                    navigate('/dashboard/profile')
                }, 1000);
            }
        }
        catch (err){
            console.error("Fetch error:", err);
        }
    }
    if (loading) return <Loading/>
    return (
        <>
            <div className="page-wrapper">
                <HeaderBar/>
                    <Background>
                    <div className='profile-wrapper'>
                        <div className="personal-infos">
                            <label className="input-data"> <strong>{t('profile_settings.change_avatar')}      </strong></label>
                            <input  type="file" id="avatar" name="avatar" accept="image/png, image/jpg, image/jpeg" onChange={(event) => setNewAvatar(event.target.files[0])} />
                            <Button text={t('profile_settings.update')} onClick={handleAvatarModification}/>
                            <hr/>
                            <form className="to-modify">
                                <label htmlFor="new_username" className="input-data"> <strong>{t('profile_settings.new_username')}   </strong></label>
                                <input type="text" name="username" onChange={(event)=>{setNewName(event.target.value)}}/>
                            </form>
                            <Button onClick={handleNameModification} text={t('profile_settings.update')}/>
                            <hr/>
                            <form className="to-modify">
                                <label className="input-data"> <strong>{t('profile_settings.new_email')}   </strong></label>
                                <input type="email" name="new_email" onChange={(event) =>{setNewEmail(event.target.value)}}/>
                            </form>
                            <Button text={t('profile_settings.update')} onClick={handleEmailModification}/>
                        </div>
                        <Button text={t('profile_settings.back')} onClick={()=> navigate('/dashboard/profile')}/>
                   
                   
                     </div>
                </Background>
            </div>
        </>
    )
}

export default SetProfile
