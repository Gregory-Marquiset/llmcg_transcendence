import './styles/App.css'
import { Welcome, SignIn, SignUp, Auth2, Auth42, Settings, Profile, Dashboard, Activity, Conversations, SetProfile, UserProfile, Friends, Policy, Privacy, CGU, GdprConfirm, Me, Error404, Watchdog
  } from './pages/index.js'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './routes/ProtectedRoute.jsx'
import { useTranslation } from 'react-i18next'
function App() {
  const { t } = useTranslation()
  return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Auth42" element={<Auth42 />} />
        <Route path="/Auth2" element={<Auth2 />} />
        <Route element={<ProtectedRoutes/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/dashboard/activity" element={<Activity/>}/>
            <Route path="/dashboard/friends" element={<Friends/>}/>
            <Route path="/dashboard/conversations" element={<Conversations/>}/>
            <Route path="/dashboard/settings" element={<Settings/>}/>
            <Route path="/dashboard/profile" element={<Profile/>}/>
            <Route path="/dashboard/profile/modify" element={<SetProfile/>}/>
            <Route path="/users/:username/profile" element={<UserProfile/>}/>
            <Route path="/dashboard/watchdog" element={<Watchdog />} />
        </Route>
      <Route path="/gdpr/confirm" element={<GdprConfirm/>}/>
      <Route path='/policy' element={<Policy/>}/>
      <Route path='/policy?/privacy' element={<Privacy/>}/>
      <Route path='/policy/terms' element={<CGU/>}/>
      <Route path='/gdpr/me' element={<Me/>}/>
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}

export default App
