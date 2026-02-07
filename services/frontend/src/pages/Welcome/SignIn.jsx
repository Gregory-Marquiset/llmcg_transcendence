import { Button, Footer, LogTitle, Background, Loading, SpinLogo} from '../../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../../animations'
import { useState } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function SignIn(){
    const { t } = useTranslation()
    const { authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn
            } = useAuth();
        const navigate = useNavigate();
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [isLoading, setIsLoading] = useState(false);
    const handleOnClick = () => navigate('/');

    const manageLogIn = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const payload = { email, password };
        try {
        const response = await fetch("/api/v1/auth/login", {
        method: 'POST',
        body: JSON.stringify( payload ),
        headers: { 'Content-Type': 'application/json' }
        });
        if(!response.ok)
        {
          alert(t('signin.errors.login_failed'))
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        const responseMe = await fetch('/api/v1/auth/me', {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${data.access_token}`
            }
        });
        if (!responseMe.ok) {
            console.error("Error fetching info ");
            setIsLoading(false);
            return ;
        }
        const userData = await responseMe.json();
        console.log(userData);
        setAuthUser({Name: userData.username});
        setIsLoggedIn(true);
        navigate('/dashboard');
        setIsLoading(false);
        localStorage.setItem("access_token", data.access_token);
        } catch (err) {
            alert(`${t('signin.errors.network')}: ${err.message}`)
        }

    }
   useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard');
        }
    }, [isLoggedIn]);
 
    if (isLoading) return <Loading showHeader={false} showButton={false}/>
    return (
        <Background>
                <div className="header-container">
                    <div className="flex justify-center gap-8 mb-8">
                        <a onClick={handleOnClick}>
                            <img src={logoheader} className="logoheader" alt="42 Tracker"/>
                        </a>
                    </div>
                    <LogTitle text='write(1, "Connection\n", 11);'/>
                </div>
                
                <div className="form-connexion-container">
                    <form onSubmit={manageLogIn} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] font-semibold text-lg w-40 text-right">
                                {t('signin.email')}
                            </label>
                            <input 
                                type="email" 
                                className="feild px-4 py-2 rounded-lg w-80" 
                                name="mail"
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <label htmlFor="pass" className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] font-semibold text-lg w-40 text-right">
                               {t('signin.password')}
                            </label>
                            <input 
                                className="feild px-4 py-2 rounded-lg w-80" 
                                type="password" 
                                name="password" 
                                id="pass" 
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>
                        
                        <br/>
                        
                        <div className="text-center">
                            <a href="/" className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#545454] to-[#eab2bb]">
                                {t('signin.password_reset')}
                            </a>
                        </div>
                        
                        <br/>
                        
                        <div className="text-center">
                            <input
                                type="submit" 
                                className="submit cursor-pointer" 
                                value={t('signin.submit')}
                            />
                        </div>
                    </form>
                </div>
                
                <SpinLogo/>
                <Footer/>
        </Background>
    )
}

export default SignIn