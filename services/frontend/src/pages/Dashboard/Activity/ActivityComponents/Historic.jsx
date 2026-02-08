import { useEffect, useState } from "react";
import { useAuth } from '../../../../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Historic({setIsLoading}){
    const accessToken = localStorage.getItem("access_token");
    const [history, setHistory] = useState([]);
    const {errStatus, setErrStatus}= useAuth();
	const { t } = useTranslation()
	
    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/v1/statistics/history', {
                method : "GET",
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization' : `Bearer ${accessToken}`
                }
            });
            setErrStatus(response.status);
            const data = await response.json();
            setHistory(data);
            //console.log(data);
        }
        catch (err){
            console.error("Error while fetchin history : ", err);
        }
    };
    useEffect(() => {
        if (accessToken)
            fetchHistory();
    }, []);
    return <>
        <div className="historic-container" key='0'>
            <h3>  {t("activity.history")}</h3>
            {history.map((item) => {
                return <div className="historic-tile" key={item.id}>
                        <h3>  <strong>{item.title}</strong> {item.description}</h3>
                        <h4>{item.created_at.slice(0, 10)}.  </h4>
                    </div>
            })}
        </div>
    </>
}
