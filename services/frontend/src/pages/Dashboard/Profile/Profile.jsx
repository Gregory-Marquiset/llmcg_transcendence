import '../../../styles/App.css'
import { Footer, Background, HeaderBar, Button, Loading, LeftMenu } from '../../../components'
import './Profile.css'
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import BadgeWindow from './BadgeWindow'
import { Error404, Error401 } from '../../index.js' // adapte si ton import est différent

function Profile() {
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
    logout, // ✅ doit exister dans AuthContext (celui qu’on a corrigé)
    accessToken, // ✅ token en state (source de vérité)
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
        credentials: "include", // utile si refresh token cookie
      });

      // ✅ On force le logout local quoi qu’il arrive pour fermer WS immédiatement
      logout();
      setLoading(false);
      navigate('/');

    } catch (err) {
      // ✅ idem : on force logout local
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
          // session invalide => logout local (ferme WS aussi)
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
                    <p>Changer l'avatar ?</p>
                    <Button text="Oui" onClick={handleOnClick} />
                    <Button text="Non" onClick={() => setModify(false)} />
                  </>
                )}
              </div>

              <p>
                <strong>{stats.progressbar / 10}%</strong>{' '}
                <progress className="progress-bar-xp" value={stats.progressbar} max={1000}></progress>
              </p>

              <div className='personal-infos-profile'>
                <h3 className='div-title'>Mes informations personnelles</h3>
                <h4 className='infos'><strong>Name : </strong> {userData.username}</h4>
                <h4 className='infos'><strong>Email : </strong> {userData.email}</h4>
                <Button text="Modifier mes infos" onClick={handleOnClick} />
              </div>

              <BadgeWindow name={userData.username} isLoading={setLoading} />

              <Button text="Se déconnecter" onClick={handleLogOut} />
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
