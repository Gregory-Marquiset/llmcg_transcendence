import './styles/App.css'
import { Welcome, SignIn, SignUp, Auth2, Dashboard } from './pages/index.js'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Auth2" element={<Auth2 />} />
        <Route path="/Dashboard" element={<Dashboard/>}/>
      </Routes>
  )
}

export default App
