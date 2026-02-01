import { logoheader } from "../../../../assets";
import { Background, Footer, LogTitle, Button } from "../../../../components";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
export default function GdprConfirm (){
    const searchParam = useSearchParams();
    const token = searchParam("token");
    const navigate = useNavigate();
    const confirmDeletion = async () => {
        if (!token){
            alert("No deletion token");
            navigate('/')
            return ;
        }
        try {
            const response = await fetch (`/api/v1/gdpr/confirm?token=${token}`, {
                method : "POST",
            });
            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/');
                }, 3000);
            }
            else {
                setStatus('error');
            }
        }
        catch (err){
            console.log(err);
        }
    }
}
    
 return (<>
    <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />
        <LogTitle text="Do you confirm to delete all your data ?"/>
        <br/>
        <p>It concerns your todo list, logtime, history. success badges progression</p>
        <br/><br/>
        <Button text="Yes"/> <Button text="No"/>
    </Background>
    <Footer/>
    </>
 )
}