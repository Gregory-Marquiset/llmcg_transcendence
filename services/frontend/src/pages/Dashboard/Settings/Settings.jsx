import '../../../styles/App.css'
import './Settings.css'
import { LogTitle } from '../../../components'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer, Background, HeaderBar, LeftMenu } from '../../../components'
import  {DangerZone,  Confidentiality, Languages } from './SettingsComponents'


function Settings() {
  const [openSection, setOpenSection] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const handleSection = sectionName => {
    setOpenSection(openSection === sectionName ? null : sectionName)
  }

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className='core-container'>
          <LeftMenu/>
          
          <div className="setting-wrapper">
            <h2 className="settings-title">
              <LogTitle text="Réglages" />
            </h2>

            <section onClick={() => handleSection('security')}>
              <LogTitle text="Sécurité" />
              <AnimatePresence>
                {openSection === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button className="btn-setting">
                      Activer l'authentification a deux facteurs
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
           <Confidentiality/>
            <section onClick={() => handleSection('notifications')}>
              <LogTitle text="Notifications" />
              <AnimatePresence>
                {openSection === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button className="btn-setting">
                      Désactiver les notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <Languages/>
            <DangerZone/>
          </div>
          </div>
        </div>
        <Footer />
      </Background>
    </>
  )
}

export default Settings
