import '../Dashboard.css'
import { AreaChart, Area, ResponsiveContainer, XAxis, CartesianGrid, YAxis, Tooltip, ReferenceLine} from 'recharts'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'

function formatMinutes(minutes) {
    if (minutes === 0)
        return "0 min";
    const h = Math.floor(minutes);
    const m = Math.round(minutes % 60);
    if (h > 0 && m > 0)
        return `${h}h ${m}min`;
    if (h > 0)
        return `${h}h`;
    return `${m}min`;
}


export default function WeeklyGraph() {
    const [weeklyLogtime, setWeeklyLogtime] = useState([]);
    const accessToken = localStorage.getItem("access_token");
    const {errStatus, setErrStatus}= useAuth();
    const fetchWeeklyLogtime = async () => {
    try {
        const response = await fetch('/api/v1/statistics/weeklylogtime', {
            method: "GET",
            headers: {
                "authorization": `Bearer ${accessToken}`,
            },
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            setErrStatus(response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return;
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Expected JSON but got:', text);
            return;
        }
        
        const data = await response.json();
        const formatted = data.map(d => ({
            day: new Date(d.day).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit"
            }),
            logtime: d.logtime / 60
        }));

        setWeeklyLogtime(formatted);
    }
    catch (err) {
        console.error('Fetch error:', err);
    }
}
    useEffect (() => {
        if (accessToken)
            fetchWeeklyLogtime();
    }, []);
    
    return (
        <div className="weekly-graph">
            <h3>Temps de travail cette semaine</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart 
                        data={weeklyLogtime}
                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="graph-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab2bb" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#eab2bb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        
                        <XAxis 
                            dataKey="day" 
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        
                        <YAxis 
                            stroke="#666"
                            style={{ fontSize: '15px' }}
                            label={{ value: "LogTime", angle: -90, position: 'insideLeft', fontSize: 20}}
                        />
                        
                        <Tooltip 
                            formatter={(value) => formatMinutes(value)}
                            labelFormatter={(label) => label}
                            contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #eab2bb',
                                borderRadius: '8px'
                            }}
                        />
                        
                        <ReferenceLine 
                            y={7} 
                            stroke="#858585"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ 
                                value: 'Objectif', 
                                position: 'right',
                                fill: '#858585',
                                fontSize: 12,
                                angle: 90
                            }}
                        />
                        
                        <Area 
                            type="monotone"
                            dataKey="logtime" 
                            stroke="#eab2bb" 
                            strokeWidth={2}
                            fill="url(#graph-gradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div> 
    );
}