import '../../../styles/App.css'
import { Footer, Background, HeaderBar, Button, Loading, LeftMenu } from '../../../components'
import './Profile.css'
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import BadgeWindow from './BadgeWindow'
import { Error404, Error401 } from '../../index.js'
import { useTranslation } from 'react-i18next'

function Profile() {
  const { t } = useTranslation()
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    avatar_path: '',
    twofa_enabled: '',
    current_streak_count: 0
  });

  const [stats, setStats] = useState({
    app_seniority: 0,
    created_at: "",
    current_streak_count: 0,
    friends_count: 0,
    last_login: "",
    monthly_logtime: 0,
    monthly_logtime_month: "",
    rank_position: 0,
    streaks_history: 0,
    task_completed: 0,
    updated_at: "",
    progressbar: 0,
    upload_count: 0
  });

  const {
    errStatus,
    setErrStatus,
    isLoggedIn,
    setIsLoggedIn,
    logout, 
    accessToken,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [modify, setModify] = useState(false);
  const [onError, setOnError] = useState(false);

  const handleOnClick = () => navigate("/dashboard/profile/modify");

  const handleLogOut = async () => {
    setLoading(true);

    try {
      const responseLogOut = await fetch('/api/v1/auth/logout', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken || ''}`,
        },
        credentials: "include",
      });
      logout();
      setLoading(false);
      navigate('/');

    } catch (err) {
      logout();
      setLoading(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const responseMe = await fetch('/api/v1/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (!responseMe.ok) {
          logout();
          console.error("Error while fetching info");
          setLoading(false);
          return;
        }

        const fetchedUserData = await responseMe.json();
        setUserData(fetchedUserData);
        setStats(fetchedUserData.stats);
        setLoading(false);

      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, logout]);

  const handleModify = () => {
    setModify((prev) => !prev);
  };

  const host = window.location.hostname;
  const avatarUrl = userData.avatar_path && !onError
    ? `http://${host}:5000/${userData.avatar_path}`
    : profilepicture;

  if (errStatus === 404) return <Error404 />;
  if (errStatus === 401) return <Error401 />;
  if (isLoading) return <Loading/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading} />
            <div className='profile-wrapper'>
              <div className='profile-picture'>
                <img
                  onError={() => setOnError(true)}
                  src={avatarUrl}
                  className='profilepic'
                  onMouseEnter={handleModify}
                  alt="profile"
                />
                {modify && (
                  <>
                    <p>{t('profile.change_avatar')}</p>
                    <Button text={t('profile.yes')} onClick={handleOnClick} />
                    <Button text={t('profile.no')} onClick={() => setModify(false)} />
                  </>
                )}
              </div>

              <p>
                <strong>{stats.progressbar / 10}%</strong>{' '}
                <progress className="progress-bar-xp" value={stats.progressbar} max={1000}></progress>
              </p>

              <div className='personal-infos-profile'>
                <h3 className='div-title'>{t('profile.personal_infos')}</h3>
                <h4 className='infos'><strong>{t('profile.name')} </strong> {userData.username}</h4>
                <h4 className='infos'><strong>{t('profile.email')} </strong> {userData.email}</h4>
                <Button text={t('profile.edit_infos')} onClick={handleOnClick} />
              </div>

              <BadgeWindow name={userData.username} isLoading={setLoading} />

              <Button text={t('profile.logout')} onClick={handleLogOut} />
              <br />
            </div>
          </div>
        </div>
        <Footer />
      </Background>
    </>
  );
}

export default Profile;
