import { useNavigate } from "react-router-dom"
import { Background, HeaderBar, Button} from "../../../../components";
import './SetProfile.css'
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";

function SetProfile(){
    const navigate = useNavigate();
    const [newName, setNewName] = useState();
    const [newEmail, setNewEmail] = useState();
    const {accessToken} = useAuth();
    const handleNameModification = async ( event ) => {
        event.preventDefault();

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
            alert(newName)
            if (!patchData.ok){
                console.error("Error while patching username");
                return ;
            }
            else 
                navigate('/dashboard/profile')
        }
        catch (err){
            console.error("Fetch error:", err);
        }
    }
    
    return (
        <>
            <div className="page-wrapper">
                <Background>
                    <HeaderBar/>
                    <div className='profile-wrapper'>
                        <div className="personal-infos">
                            <label className="input-data"> <strong>Changer son avatar :      </strong></label>
                            <input  type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
                            <Button text="Mettre a jour"/>
                            <hr/>
                            <form className="to-modify">
                                <label htmlFor="new_username" className="input-data"> <strong>Nouveau username :   </strong></label>
                                <input type="new_username" name="new_username" id="new_username" onChange={(event)=>{event.preventDefault(); setNewName(event.target.value)}}/>
                            </form>
                            <Button onClick={handleNameModification} text="Mettre a jour"/>
                            <hr/>
                            <form className="to-modify">
                                <label className="input-data"> <strong>Nouveau mail :   </strong></label>
                                <input type="text" name="new_email"/>
                            </form>
                            <Button text="Mettre a jour"/>
                        </div>
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


// htpp://localhost:5000/api/v1/users/user/me
// Method: PATCH
// Header Authorization nécessaire
// Sert à modifier les infos du user connecté
// À mettre dans le body les infos que tu veux changer username et/ou email: {
//     new_username: string,
//     new_email: string}
// Renvoie dans le body {
//     id: integer,
//     username: string,
//     email: string,
//     avatar_path: string,
//     twofa_enabled: integer,
//     createdAt: string}
