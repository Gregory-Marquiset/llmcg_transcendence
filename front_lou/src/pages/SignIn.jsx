import { Button, Footer } from '../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../assets'

function SignIn(){

    return <>
    <div className="min-h-screen bg-gradient-to-br from-[#545454] via-pink-50 to-[#545454] flex flex-col items-center justify-center">
        <div className="flex justify-center gap-8 mb-8">
            <a href="https://projects.intra.42.fr/projects/ft_transcendence" target="_blank">
                <img src={logoheader} className="logoheader" alt="42 Tracker"/>
            </a>
        </div>
        <h1 class="welcome-title" className="text-4xl w-full text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] p-2">Connection</h1>
        <br/>
        <form>
        <label class="field-name">
            Adresse mail :
            <input type="text" class="feild" name="mail" />
        </label>
        <br/><br/>
        <label class="field-name" for="pass">
            Mot de passe : 
            <input display="block" class="feild" type="password" name="password" />
        </label>
        <br/>
        <a href="/">Mot de passe oublie ?</a>
        <br/>
        <input type="submit" class="submit" value="Se connecter" />
        </form>
        <img src={favicon} className="favicon"/>
        <Footer/>
    </div>
    </>
}

export default SignIn