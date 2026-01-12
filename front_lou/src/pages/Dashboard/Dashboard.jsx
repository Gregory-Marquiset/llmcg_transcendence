import { useAuth } from '../../context/AuthContext'
import '../../styles/App.css'
import './DashboardStyles.css'
import { useNavigate } from 'react-router-dom'
import { Footer, Background, HeaderBar, LeftMenu} from '../../components'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'


function Dashboard() {
<<<<<<< HEAD
  const [quote, setQuote] = useState();
  const navigate = useNavigate();
    const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn} = useAuth();
  if(!isLoggedIn)
  {
    navigate('/signIn');
  }
=======
  const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn} = useAuth();
   console.log('authUser:', authUser);
>>>>>>> feat/frontend
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
<<<<<<< HEAD
              \ {authUser?.Name}
=======
               HELLO {authUser?.Name}
>>>>>>> feat/frontend
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard