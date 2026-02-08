import "./Footer.css"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export default function Footer(){
    const { t } = useTranslation()
    const navigate = useNavigate()

    const goToPolicy = (e) => {
        e.preventDefault()
        navigate('/policy')
    }

    return <>
        <div className="footer">
            <div className="team">  
                <code className="footersign">ft_transcendance by : </code> 
                <a href="https://profile.intra.42.fr/users/lobriott" target="_blank" rel="noreferrer">lobriott - </a>
                <a href="https://profile.intra.42.fr/users/gmarquis" target="_blank" rel="noreferrer">gmarquis - </a>
                <a href="https://profile.intra.42.fr/users/lzaengel" target="_blank" rel="noreferrer">lzaengel - </a>
                <a href="https://profile.intra.42.fr/users/cdutel" target="_blank" rel="noreferrer">cdutel - </a>
                <a href="https://profile.intra.42.fr/users/mda-cunh" target="_blank" rel="noreferrer">mda-cunh </a>
                <a href="/policy" className="footersign-terms" onClick={goToPolicy}>
                    - {t('footer.legal_docs')}
                </a>
            </div>
        </div>
    </>
}
