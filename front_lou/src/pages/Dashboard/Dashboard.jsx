import { useAuth } from '../../context/AuthContext'
import '../../styles/App.css'
import './DashboardStyles.css'
import { useNavigate } from 'react-router-dom'
import { Footer, Background, HeaderBar, LeftMenu} from '../../components'
import { useEffect, useState } from 'react'


function Dashboard() {
  const [quote, setQuote] = useState();
  const navigate = useNavigate();
    // const { authUser,
    //       setAuthUser,
    //       isLoggedIn,
    //       setIsLoggedIn} = useAuth();
        const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn,
          accessToken,
          setAccessToken
        } = useAuth();
  if(!isLoggedIn)
  {
    navigate('/signIn');
  }

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
              \ {authUser?.Name}
              {accessToken}
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard