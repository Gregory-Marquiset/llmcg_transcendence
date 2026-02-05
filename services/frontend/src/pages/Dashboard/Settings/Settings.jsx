import '../../../styles/App.css'
import './Settings.css'
import { LogTitle } from '../../../components'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer, Background, HeaderBar, LeftMenu } from '../../../components'
import  { DangerZone, Confidentiality, Languages } from './SettingsComponents'
import { useAuth } from '../../../context/AuthContext'

function Settings() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className='core-container'>
          <LeftMenu setIsLoading={setIsLoading}/>
          
          <div className="setting-wrapper">
            <h2 className="settings-title">
              <LogTitle text="Réglages" />
            </h2>
           <Confidentiality/>
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
