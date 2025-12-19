import { Button, Footer, LogTitle, Background, Separator } from '../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../assets'
import '../styles/App.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../animations'

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
  
  return (
    <>
      <Background>
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
        <LogTitle text='printf("Welcome");' />
        <div className="card">
          <motion.div
            className="card"
            variants={containerVariants}
            initial="hidden"
            animate={isExiting ? 'exit' : 'visible'}
          >
            <motion.div variants={itemVariants}>
              <Button onClick={handleSignIn} text="Se connecter" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button onClick={handleSignUp} text="Créer un compte" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Separator />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button onClick={handleAuth2} text="Se connecter avec 42" />
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
