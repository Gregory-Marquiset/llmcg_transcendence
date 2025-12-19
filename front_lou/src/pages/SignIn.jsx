import { Button, Footer, LogTitle, Background} from '../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../assets'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../animations'

function SignIn(){
    const { authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn} = useAuth();
    const navigate = useNavigate();

    const handleOnClick = () => {
        navigate('/');
    }
    const manageLogIn = (event) => {
        event.preventDefault();
        navigate('/dashboard');
        setIsLoggedIn(true);
        setAuthUser({Name: "Lou"})
    }

    return <>
    <Background>
          <div className="flex justify-center gap-8 mb-8">
            <a onClick={handleOnClick}>
                <img src={logoheader} className="logoheader" alt="42 Tracker"/>
            </a>
        </div>
        
        <LogTitle text='write(1, "Connection\n", 11);'/>

        <form onSubmit={manageLogIn} className="space-y-6">
            <div className="flex items-center gap-4">
                <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] font-semibold text-lg w-40 text-right">
                    Adresse mail :
                </label>
                <input 
                    type="email" 
                    className="feild px-4 py-2 rounded-lg w-80" 
                    name="mail" 
                />
            </div>
            
            <div className="flex items-center gap-4">
                <label htmlFor="pass" className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] font-semibold text-lg w-40 text-right">
                    Mot de passe :
                </label>
                <input 
                    className="feild px-4 py-2 rounded-lg w-80" 
                    type="password" 
                    name="password" 
                    id="pass" 
                />
            </div>
            <br/>
            <div className="text-center">
                <a href="/" className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#545454] to-[#eab2bb]">
                    Mot de passe oublié ?
                </a>
            </div>
            <br/>
            <div className="text-center">
                <input
                    type="submit" 
                    className="submit cursor-pointer" 
                    value="Se connecter"
                />
            </div>
        </form>
        
        <img src={favicon} className="favicon mt-8" alt="Logo animé"/>
        <Footer/>
    </Background>
    </>
}

export default SignIn