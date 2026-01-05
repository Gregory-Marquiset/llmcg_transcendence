import { Button }from '../'
import './LeftMenu.css'
import { useNavigate } from 'react-router-dom'

export default function(){
    const navigate = useNavigate();
    const handleOnClick = ({text}) => {
        navigate(text);
    }
    return (
        <div className="left-menu">
            <Button onClick={() => navigate("/dashboard/activity")} text="Mes activités" />
            <Button onClick={() => navigate("/dashboard/achievement")} text="Mes achievements" />
            <Button onClick={() => navigate("/dashboard/conversations")} text="Mes Conversations" />
            <Button onClick={() => navigate("/dashboard/ressources")} text="Mes ressources" />
            <Button onClick={() => navigate("/dashboard/exportdata")} text="Exporter mes data" />
            <Button onClick={() => navigate("/dashboard/about")} text="A propos" />
          </div>
    )
}
