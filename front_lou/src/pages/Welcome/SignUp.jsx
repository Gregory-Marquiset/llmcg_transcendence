import { Button, Footer, LogTitle, Background } from '../../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../../animations'
import { motion } from 'framer-motion'
import { useState } from 'react'

function SignUp() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  const handleNavigateWithDelay = (path, delay = 500) => {
    setIsExiting(true)
    setTimeout(() => {
      navigate(path)
    }, delay)
  }

  const handleOnClick = () => handleNavigateWithDelay('/', 600)

  return (
    <Background>
        <div className="header-container">
          <div className="flex justify-center gap-8 mb-8">
            <a onClick={handleOnClick}>
              <img src={logoheader} className="logoheader" alt="42 Tracker"/>
            </a>
          </div>
          <LogTitle text="void *ft_register(t_user *new_user);" />
        </div>
        
        <div className="form-container">
          <motion.div
            className="card"
            variants={containerVariants}
            initial="hidden"
            animate={isExiting ? 'exit' : 'visible'}
          >
            <form className="space-y-7">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right">
                    Nom :
                  </label>
                  <input
                    type="text"
                    className="feild px-4 py-2 rounded-lg w-80"
                    name="lastname"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right">
                    Prénom :
                  </label>
                  <input
                    type="text"
                    className="feild px-4 py-2 rounded-lg w-80"
                    name="firstname"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right">
                    Adresse mail :
                  </label>
                  <input
                    type="email"
                    className="feild px-4 py-2 rounded-lg w-80"
                    name="email"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="password"
                    className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right"
                  >
                    Mot de passe :
                  </label>
                  <input
                    className="feild px-4 py-2 rounded-lg w-80"
                    type="password"
                    name="password"
                    id="password"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="confirmPassword"
                    className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right"
                  >
                    Confirmez :
                  </label>
                  <input
                    className="feild px-4 py-2 rounded-lg w-80"
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="text-center">
                  <input
                    type="submit"
                    className="submit cursor-pointer"
                    value="Créer un compte"
                  />
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
        
        <img src={favicon} className="favicon"/>
        <Footer />
    </Background>
  )
}

export default SignUp