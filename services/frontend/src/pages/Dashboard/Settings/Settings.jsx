import '../../../styles/App.css'
import './Settings.css'
import { LogTitle } from '../../../components'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer, Background, HeaderBar, LeftMenu } from '../../../components'

function Settings() {
  const [openSection, setOpenSection] = useState(null)

  const handleSection = sectionName => {
    setOpenSection(openSection === sectionName ? null : sectionName)
  }

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className="content-wrapper">
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
                    <div className="btn-setting">Changer mon mot de passe</div>
                    <div className="btn-setting">
                      Activer l'authentification a deux facteurs
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <section onClick={() => handleSection('confidentiality')}>
              <LogTitle text="Confidentialité" />
              <AnimatePresence>
                {openSection === 'confidentiality' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="btn-setting">Supprimer mes données</div>
                    <div className="btn-setting">Exporter mes données</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
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
                    <div className="btn-setting">
                      Désactiver les notifications
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <section onClick={() => handleSection('languagePreference')}>
              <LogTitle text="Préférence de langues" />
              <AnimatePresence>
                {openSection === 'languagePreference' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="btn-setting">Choisir Francais</div>
                    <div className="btn-setting">Choisir Anglais</div>
                    <div className="btn-setting">Choisir Espagnol</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <section onClick={() => handleSection('dangerZone')}>
              <LogTitle text="Danger zone" />
              <AnimatePresence>
                {openSection === 'dangerZone' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="btn-setting">Supprimer mon compte</div>
                    <div className="btn-setting">Effacer mes données</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
        <Footer />
      </Background>
    </>
  )
}

export default Settings
