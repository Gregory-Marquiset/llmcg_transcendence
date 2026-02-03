import './styles/App.css'
import { Welcome, SignIn, SignUp, Auth2, Settings, Profile, About, Dashboard, Ressources, Activity, 
  Achievement, Conversations, ExportData, SetProfile, UserProfile, Policy, Privacy, CGU, GdprConfirm, Me} from './pages/index.js'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './routes/ProtectedRoute.jsx'
import { useTranslation, Trans } from 'react-i18next'
function App() {
  const { t } = useTranslation()
  return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Auth2" element={<Auth2 />} />

        <Route element={<ProtectedRoutes/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/dashboard/activity" element={<Activity/>}/>
            <Route path="/dashboard/achievement" element={<Achievement/>}/>
            <Route path="/dashboard/conversations" element={<Conversations/>}/>
            <Route path="/dashboard/ressources" element={<Ressources/>}/>
            <Route path="/dashboard/exportdata" element={<ExportData/>}/>
            <Route path="/dashboard/about" element={<About/>}/>
            <Route path="/dashboard/settings" element={<Settings/>}/>
            <Route path="/dashboard/profile" element={<Profile/>}/>
            <Route path="/dashboard/profile/modify" element={<SetProfile/>}/>
            <Route path="/users/:username/profile" element={<UserProfile />} />
            
        </Route>
      <Route path="/gdpr/confirm" element={<GdprConfirm/>}/>
      <Route path='/policy' element={<Policy/>}/>
      <Route path='/policy?/privacy' element={<Privacy/>}/>
      <Route path='/policy/terms' element={<CGU/>}/>
      <Route path='/gdpr/me' element={<Me/>}/>
    </Routes>
  )
}

export default App