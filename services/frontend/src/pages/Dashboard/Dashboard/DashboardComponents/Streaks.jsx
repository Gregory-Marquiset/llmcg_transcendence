import { useEffect, useState } from 'react'
import '../Dashboard.css'
import { Pie, Cell, PieChart, ResponsiveContainer } from 'recharts'

export default function Streaks() {
    const [nbStreaks, setNbStreaks] = useState(0);
    const [displayStreak, setDisplayStreak] = useState(nbStreaks % 7);
    const [pieColor, setPieColor] = useState("");
    useEffect(() => {
        if (nbStreaks > 7)
            setPieColor("#858585");
        else
            setPieColor("#e0e0e0");
    }, []);
    useEffect(() => {
        if (nbStreaks && !displayStreak)
            setDisplayStreak(7);
    }, []);
    const data = Array.from({ length: 7 }, (_, i) => ({
        value: 1,
        active: i < displayStreak
    }));
    
    return (
        <div className="streaks">
            <h3>{nbStreaks === 0 ? 'Streaks 💀' : 'Streaks 🔥'}</h3>
            <div className="streak-container">
                <ResponsiveContainer width="100%" height={300}>
                    {nbStreaks !== 0 && <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            startAngle={450}
                            endAngle={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((segment, i) => (
                                <Cell 
                                    key={i} 
                                    fill={segment.active ? '#eab2bb' : pieColor}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                }
                </ResponsiveContainer>
                <div className="streak-center">
                    {nbStreaks !== 0 &&
                    <>
                        <div className={`streak-number ${displayStreak === 0 ? 'zero' : ''}`}>
                            {nbStreaks}
                        </div>
                        <div className="streak-label">
                            {nbStreaks === 0 ? 'jour' : nbStreaks === 1 ? 'jour' : 'jours'}
                        </div>
                    </>
                    }
                    {nbStreaks === 0 &&
                        <h3>You<br/>have<br/>no<br/>streaks...<br/></h3>

                    }
                </div>
                
            </div>
        </div>
    );
}