import { Button, Footer, LogTitle, Background, Separator } from '../../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import '../../styles/App.css'
import './WelcomeStyles.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../../animations'
import { useTranslation } from 'react-i18next'

function Welcome() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  const handleNavigateWithDelay = (path, delay = 500) => {
    setIsExiting(true)
    setTimeout(() => {
      navigate(path)
    }, delay)
  }
  const handleSignIn = () => handleNavigateWithDelay('/signIn', 300)
  const handleSignUp = () => handleNavigateWithDelay('/signUp', 600)
  const handleAuth2 = () => handleNavigateWithDelay('/Auth2', 600)
  
  const { t, i18n } = useTranslation()
  const handleLanguageChange = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('lang', nextLang)
  }

  return (
    <>
      <Background>
        <div className='header-container'>
        <motion.div
          className="welcome-transition"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          variants={containerVariants}
        >
          <a
            href="https://projects.intra.42.fr/projects/ft_transcendence"
            target="_blank"
          >
            <img src={logoheader} className="logoheader" alt="42 Tracker" />
          </a>
        
        </motion.div>
        </div>
        <LogTitle text='printf("Welcome");' />
       
        <div className="btn-container">
          <motion.div
            className="card"
            variants={containerVariants}
            initial="hidden"
            animate={isExiting ? 'exit' : 'visible'}
          >
            <motion.div variants={itemVariants}>
              <Button onClick={handleSignIn} text={t('home.login')}/>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button onClick={handleSignUp} text={t('home.register')} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Separator />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button onClick={handleAuth2} text={t('home.login42')} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Separator />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleLanguageChange}
                text={t('home.language')}
              />
            </motion.div>
          </motion.div>
        </div>
        <img src={favicon} className="favicon" />
        <Footer />
      </Background>
    </>
  )
}

export default Welcome
