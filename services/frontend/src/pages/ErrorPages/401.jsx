import { Background, LogTitle, Button, Footer, SpinLogo } from "../../components"

export default function Error401 () {
    return (
    <>
        <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />

        <LogTitle text="401 — Session expired" />

        <br />

        <p>
            Your session has expired for security reasons.
            <br />
            Please log in again to continue.
        </p>

        <br /><br />

        <Button text="Log in again" onClick={() => navigate('/login')} />
            <SpinLogo/>
        </Background>
        <Footer />
    </>
    )

}