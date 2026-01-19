import { useAuth } from '../../../context/AuthContext'
import '../../../styles/App.css'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useEffect, useState } from 'react'
import WeeklyGraph from './WeeklyGraph'

function Dashboard() {
  const [quote, setQuote] = useState();
  const navigate = useNavigate();
        const {
          isLoggedIn,
          setIsLoggedIn
        } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      twofa_enabled: ''
  });
  useEffect(() => {
  const fetchProfile = async ()  => {
    try {
      const response = await fetch('api/v1/auth/me', {
        method : 'GET',
        headers : {
          'Authorization' : `Bearer ${accessToken}`
        }
      });
      if (!response.ok){
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/');
        alert("cannot fetch your profile, automatic log out");
        return ;
      }
      const fetchedUserData = await response.json();
      console.log(fetchedUserData);
      setUserData(fetchedUserData);
      setIsLoading(false);
    }
    catch (err){
      console.log(err);
    }
  }
  if (accessToken) {
      fetchProfile();
  }
  }, [accessToken]);
useEffect(() => {
      if (!isLoggedIn) {
        navigate('/signIn');
      }
    }, [isLoggedIn, navigate]);

    if (isLoading) return <Loading duration={400}  showButton={false}/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading} />
            <div className='content-container'>
              Bonjour {userData.username},
              <WeeklyGraph/>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard