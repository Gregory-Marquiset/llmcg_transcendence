import { logoheader } from "../../../../assets";
import { Background, Footer, LogTitle, Button } from "../../../../components";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../Settings.css'
import { useTranslation } from "react-i18next";

export default function Me () {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [gdprUserData, setGdprUserData] = useState({});
    const token = searchParams.get("token");
    const [displayGdpr, setDisplayGdpr] = useState(false);
    const navigate = useNavigate();
    const fetchAllData = async () => {
        try {
            const response = await fetch(`/api/v1/gdpr/me?token=${token}`, {
                method : "GET",
            });
            if (!response.ok){
                console.log("error response");
                return ;
            }
            const data = await response.json();
            setGdprUserData(data);
            //console.log("MES DATAS ", data);
        }
        catch(err){
            console.log("ERROR : ", err);
        }
    }
    useEffect(() => {
        if (token)
            fetchAllData();
    }, []);
      const exportUserData = () => {
        if (!gdprUserData) {
            console.log("No GDPR data to export");
            return;
        }
        const json = JSON.stringify(gdprUserData, null, 2);
        const blob = new Blob([json], {
            type: "application/json;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "personal_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const updateView = () => {
        if (displayGdpr)
            setDisplayGdpr(false)
        else
            setDisplayGdpr(true)
    }

    return (
        <>
            <Background>
                <img src={logoheader} className="logoheader" alt="42 Tracker" />
                <LogTitle text={t("gdpr_me.title")}/>
                <br/>
                <button className="btn-setting" onClick={exportUserData}>{t("gdpr_me.download")}</button>
                <button className="btn-setting" onClick={updateView}>{t("gdpr_me.show")}</button>
                {displayGdpr && <pre className="json-preview">
                    <strong>{t("gdpr_me.json_preview")} </strong><br/>
                    {JSON.stringify(gdprUserData, null, 2)}
                </pre>}
                <button className="btn-setting" onClick={() => navigate('/')}>{t("gdpr_me.back")}</button>
            </Background>
            <Footer/>
        </>
    )
}
