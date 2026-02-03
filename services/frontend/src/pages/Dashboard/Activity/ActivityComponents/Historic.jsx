import { useEffect, useState } from "react";
// const data = [
//     {
//         id: 1,
//         title: 'Experience',
//         description : 'A gagné 10xp',
//         date : '30/12/2025'
//     },
//     {
//         id: 2,
//         title: 'A upload a file',
//         description : 'sujet minishell',
//         date : '30/12/2025'
//     },
//     {
//         id: 3,
//         title: 'A un nouvel ami',
//         description : 'lobriott',
//         date : '30/12/2025'
//     }
// ]

export default function Historic({setIsLoading}){
    const accessToken = localStorage.getItem("access_token");
    const [history, setHistory] = useState([]);
    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/v1/statistics/history', {
                method : "GET",
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization' : `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            setHistory(data);
            console.log(data);
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
            <h3>   Votre historique</h3>
            {history.map((item) => {
                return <div className="historic-tile" key={item.id}>
                        <h3>  <strong>{item.title}</strong> {item.description}</h3>
                        <h4>{item.created_at.slice(0, 10)}.  </h4>
                    </div>
            })}
        </div>
    </>
}