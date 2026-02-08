import { logoheader } from "../../../../assets";
import { Background, Footer, LogTitle, Button } from "../../../../components";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

export default function GdprConfirm (){
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [status, setStatus] = useState("");
    const confirmDeletion = async () => {
        if (!token){
            alert(t("gdpr_confirm.no_token"));
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

 return (<>
    <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />
        <LogTitle text={t("gdpr_confirm.title")}/>
        <br/>
        <p>{t("gdpr_confirm.description")}</p>
        <br/><br/>
        <Button text={t("gdpr_confirm.yes")} onClick={confirmDeletion}/> <Button text={t("gdpr_confirm.no")} onClick={()=> navigate('/')}/>
    </Background>
    <Footer/>
    </>
 )
}
