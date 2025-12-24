import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import '../../styles/App.css'
import './DashboardStyles.css'
import { Button, Footer, Background, HeaderBar, LeftMenu} from '../../components'
import { profile, setting } from '../../assets'

function Dashboard() {
  const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn} = useAuth();
   console.log('authUser:', authUser);
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
               HELLO {authUser?.Name}
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard
