import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { Button } from '../../../../components';
import { motion, AnimatePresence } from 'framer-motion'
const data = [
    {
        id : 1,
        title : 'Sujet minishell'
    },
    {
        id : 2,
        title : 'doc sur les pipes'
    },
    {
        id : 3,
        title : 'liste roadmap'
    }
]

export default function LastUploads({setIsLoading}){
    const navigate = useNavigate();
    const [ hoveredId, setHoveredId] = useState(null);
    const handleOnClick = ((path) => {
        setIsLoading(true);
        setTimeout(()=> {
            navigate(path);
            setIsLoading(false);
        }, 500);
    })
    return (
            <div className="lastuploads-container">
                <h3>   Vos derniers téléchargements</h3>
                {data.map((file) => (
                    <div
                        key={file.id}
                        className="historic-tile"
                        onMouseEnter={() => setHoveredId(file.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <h3>   {file.title}</h3>

                        {hoveredId === file.id && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button text="Ouvrir"
                                onClick={() => handleOnClick('/dashboard/ressources')}/>
                                </motion.div>
                        )}
                    </div>
                ))}
            </div>
    )
}