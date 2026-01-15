import { useAuth } from '../../context/AuthContext'
import '../../styles/App.css'
import './DashboardStyles.css'
import { useNavigate } from 'react-router-dom'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../components'
import { useEffect, useState } from 'react'

function Dashboard() {
  const [quote, setQuote] = useState();
  const navigate = useNavigate();
        const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn,
          accessToken,
          setAccessToken
        } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
      if (!isLoggedIn) {
        navigate('/signIn');
      }
    }, [isLoggedIn, navigate]);

    if (isLoading) return<Loading/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading} />
            <div className='content-container'>
              Bonjour {authUser?.Name},
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard