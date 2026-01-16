import { useState } from "react";
import "./Footer.css" 
import { useNavigate }  from 'react-router-dom'
import Loading from "../Loading/Loading";

export default function Footer(){
    return <>
            <div className="footer">
            <div className="team">  
                <code className="footersign">ft_transcendance by :     </code> 
                <a href="https://profile.intra.42.fr/users/lobriott" target="_blank">lobriott - </a>
                <a href="https://profile.intra.42.fr/users/gmarquis" target="_blank">gmarquis - </a>
                <a href="https://profile.intra.42.fr/users/lzaengel" target="_blank">lzaengel - </a>
                <a href="https://profile.intra.42.fr/users/cdutel" target="_blank">cdutel       </a>
                <a href="/policy"className="footersign-terms">Politique de confidentialité</a>
            </div>
            </div>
        </>
}
