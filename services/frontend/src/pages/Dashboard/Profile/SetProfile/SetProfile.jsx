import { useNavigate } from "react-router-dom"
import { Background, HeaderBar, Button, Loading } from "../../../../components";
import './SetProfile.css'
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
function SetProfile(){
    const navigate = useNavigate();
    const [newAvatar, setNewAvatar] = useState();
    const [newName, setNewName] = useState();
    const [newEmail, setNewEmail] = useState();
    const {accessToken} = useAuth();
    const [loading, setLoading] = useState(false);
    const handleAvatarModification = async ( event ) => {
        setLoading(true);
        event.preventDefault();
        if (!newAvatar){
            alert("Aucune image n'a été sélectionnée");
            return ;
        }
        try{
            const formData = new FormData();
            formData.append('avatar', newAvatar);
            const response = await fetch('/api/v1/users/user/me/avatar', {
                method : 'POST',
                headers : {
                    'Authorization' : `Bearer ${accessToken}`
                },
                body : formData
            });
            if (!response.ok){
                alert("The avatar could not exceed 5mo");
                return ;
            }
            setTimeout(() => {
                alert("Avatar modifié avec succès !"),
                setLoading(false),
                navigate('/dashboard/profile')},
            1000);
            } catch (err) {
                alert(err);
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
                <Background>
                    <HeaderBar/>
                    <div className='profile-wrapper'>
                        <div className="personal-infos">
                            <label className="input-data"> <strong>Changer son avatar :      </strong></label>
                            <input  type="file" id="avatar" name="avatar" accept="image/png, image/jpg, image/jpeg" onChange={(event) => setNewAvatar(event.target.files[0])} />
                            <Button text="Mettre a jour" onClick={handleAvatarModification}/>
                            <hr/>
                            <form className="to-modify">
                                <label htmlFor="new_username" className="input-data"> <strong>Nouveau username :   </strong></label>
                                <input type="text" name="username" onChange={(event)=>{setNewName(event.target.value)}}/>
                            </form>
                            <Button onClick={handleNameModification} text="Mettre a jour"/>
                            <hr/>
                            <form className="to-modify">
                                <label className="input-data"> <strong>Nouveau mail :   </strong></label>
                                <input type="email" name="new_email" onChange={(event) =>{setNewEmail(event.target.value)}}/>
                            </form>
                            <Button text="Mettre a jour" onClick={handleEmailModification}/>
                        </div>
                        <Button text="Retour" onClick={()=> navigate('/dashboard/profile')}/>
                    </div>
                </Background>
            </div>
        </>
    )
}

export default SetProfile

// htpp://localhost:5000/api/v1/users/user/me/avatar
// Method: POST
// Header Authorization nécessaire
// Sert à upload un avatar


