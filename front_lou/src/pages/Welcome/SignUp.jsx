import { Button, Footer, LogTitle, Background } from '../../components'
import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import { containerVariants, itemVariants, logoVariants, faviconVariants } from '../../animations'
import { motion } from 'framer-motion'
import { useState } from 'react'

function SignUp() {
  const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: ''
    });
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  const handleChange = (e) => {
    const {name, value} = e.target //e.target =>input sur lequel on a tape
    setFormData({                
      ...formData, //...formData = copie tout l'objet existant
       [name] : value //e.target.name = l'attribut name de cet input (ex: "username")
                                  //e.target.value = ce que l'user a tapé [name]: value = met à jour juste la clé qui correspond au name
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()  // evite le rechargement de page
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // dit au backend qu'on envoie du JSON
      },
      body: JSON.stringify(formData)  // convertit l'objet JS en string JSON
    })
    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers.get('content-type'))
    const data = await response.json()// Parse la réponse
    if (!response.ok) // response.ok = true si status 200-299
        navigate('/signin')  // Redirige vers login
    else 
        console.error('Erreur:', data) // Affiche un message d'erreur à l'user
    
  } catch (error) {
    console.error('Erreur réseau:', error) // Affiche un message d'erreur réseau
  }
}

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
            <form onSubmit={handleSubmit} className="space-y-7">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-[#eab2bb] to-[#545454] text-lg w-40 text-right">
                    Username :
                  </label>
                  <input
                    type="text"
                    className="feild px-4 py-2 rounded-lg w-80"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
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