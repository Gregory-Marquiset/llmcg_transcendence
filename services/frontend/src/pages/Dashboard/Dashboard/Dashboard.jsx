import { useAuth } from '../../../context/AuthContext'
import '../../../styles/App.css'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useEffect, useState } from 'react'
import { WeeklyGraph, Streaks, MotivationBox, Todo } from './DashboardComponents'
import Error404 from '../../ErrorPages/404';
import Error401 from '../../ErrorPages/401';
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const {errStatus}= useAuth();
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      twofa_enabled: '',
      current_streak_count: 0
  });
  const [stats, setStats] = useState({
    app_seniority : 0,
    created_at : "",
    current_streak_count : 0,
    friends_count : 0,
    last_login : "",
    monthly_logtime: 0,
    monthly_logtime_month: "",
    rank_position: 0,
    streaks_history: 0,
    task_completed: 0,
    updated_at: "",
    progressbar: 0,
    upload_count : 0 });
  useEffect(() => {
  const fetchProfile = async ()  => {
    try {
      setIsLoading(true);
      const response = await fetch('api/v1/auth/me', {
          method : 'GET',
          headers : {
            'Authorization' : `Bearer ${accessToken}`
          }
        });
        setIsLoading(false);
        if (!response.ok){
          localStorage.clear();
          setIsLoggedIn(false);
          navigate('/');
          alert("cannot fetch your profile, automatic log out");
          return ;
        }
        const fetchedUserData = await response.json();
        setUserData(fetchedUserData);
        setStats(fetchedUserData.stats);
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
    if (errStatus === 404) return <Error404/>
    if (errStatus === 401) return <Error401/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading} className="left-menu"/>
            <div className='content-container'>
              <br/>
              <>      {t("dashboard.hello")} {userData.username},</>
              <br/>
              <div className='module-container'>
                <WeeklyGraph/>
                <Streaks count={stats.current_streak_count}/>
              </div>
              <div className='module-container'>
                <Todo/>
                <MotivationBox/>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard
