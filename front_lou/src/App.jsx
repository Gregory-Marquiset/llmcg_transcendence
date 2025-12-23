import './styles/App.css'
import { Welcome, SignIn, SignUp, Auth2, Settings, Profile, About, Dashboard, Ressources, Activity, Achievement, Conversations, ExportData } from './pages/index.js'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Auth2" element={<Auth2 />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/dashboard/activity" element={<Activity/>}/>
        <Route path="/dashboard/achievement" element={<Achievement/>}/>
        <Route path="/dashboard/conversations" element={<Conversations/>}/>
        <Route path="/dashboard/ressources" element={<Ressources/>}/>
        <Route path="/dashboard/exportdata" element={<ExportData/>}/>
        <Route path="/dashboard/about" element={<About/>}/>
        <Route path="/dashboard/settings" element={<Settings/>}/>
        <Route path="/dashboard/profile" element={<Profile/>}/>
      </Routes>
  )
}

export default App
//MyAchievement