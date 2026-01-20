import '../Dashboard.css'
import { AreaChart, Area, ResponsiveContainer, XAxis, CartesianGrid, YAxis, Tooltip, ReferenceLine} from 'recharts'

const data = [
    { date: "01/01/2026", logtime: 0 },
    { date: "02/01/2026", logtime: 5.5 },
    { date: "03/01/2026", logtime: 7 },
    { date: "04/01/2026", logtime: 3.5 },
    { date: "05/01/2026", logtime: 2 },
    { date: "06/01/2026", logtime: 11 },
    { date: "07/01/2026", logtime: 11.2},
    { date: "08/01/2026", logtime: 12 },
    { date: "09/01/2026", logtime: 8.5 },
    { date: "10/01/2026", logtime: 0 },
    { date: "11/01/2026", logtime: 9.5 }
]
export default function WeeklyGraph() {
    return (
        <div className="weekly-graph">
            <h3>Temps de travail cette semaine</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart 
                        data={data}
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
                            dataKey="date" 
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        
                        <YAxis 
                            stroke="#666"
                            style={{ fontSize: '15px' }}
                            label={{ value: "LogTime", angle: -90, position: 'insideLeft', fontSize: 20}}
                        />
                        
                        <Tooltip 
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