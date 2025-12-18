import { Button, Footer } from '../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../assets'
import '../styles/App.css' 

function Welcome(){
    const navigate = useNavigate();

    const handleSignIn= () => {
        navigate('/signIn');
    }
    const handleSignUp= () => {
        navigate('/signUp');
    }
    const handleAuth2= () => {
        navigate('/Auth2');
    }
    return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#545454] via-pink-50 to-[#545454] flex flex-col items-center justify-center">
        <div className="flex justify-center gap-8 mb-8">
            <a href="https://projects.intra.42.fr/projects/ft_transcendence" target="_blank">
                <img src={logoheader} className="logoheader" alt="42 Tracker"/>
            </a>
        </div>
            <h1 class="welcome-title" className="text-4xl w-full text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] p-2">
                Hello.
            </h1>
            <div className="card">
            <Button onClick={handleSignIn} text="Se connecter"/>
            <Button onClick={handleSignUp} text="Créer un compte"/>
            <div className="flex items-center gap-3 py-3">
            <div className="flex-1 h-px bg-slate-600"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-slate-600"></div>
            </div>
            <Button onClick={handleAuth2} text="Se connecter avec 42"/>
            </div>
            <img src={favicon} className="favicon"/>
        <Footer/>
        </div>
    </>
    )
}

export default Welcome