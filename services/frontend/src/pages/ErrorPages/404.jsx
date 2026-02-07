import { Background, LogTitle, Button, Footer, SpinCube, SpinLogo } from "../../components"
import { logoheader } from "../../assets"
import { useNavigate } from 'react-router-dom'
export default function Error404(){
    const navigate = useNavigate();
    return (
    <>
        <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />

        <LogTitle text="404 — Page not found" />

        <br />

        <p>
            The page you are looking for doesn’t exist or has been moved.
            <br />
            Let’s get you back on track.
        </p>

        <br /><br />

        <Button text="Go back home" onClick={() => navigate('/')} />
            <SpinLogo/>
        </Background>
        <Footer />
    </>
    )
}
