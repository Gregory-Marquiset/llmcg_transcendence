import '../../../styles/App.css'
import { Footer, Background, HeaderBar, Button, Loading, LeftMenu } from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import BadgeWindow from './BadgeWindow'

function Profile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      twofa_enabled: ''
  });
  const {isLoggedIn, setIsLoggedIn} = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [modify, setModify] = useState(false);
  const [onError, setOnError] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const handleOnClick = () =>  navigate("/dashboard/profile/modify");
  const handleLogOut = async () => {
    setLoading(true);
    try {
      const responseLogOut = await fetch('/api/v1/auth/logout', {
        method : 'DELETE',
        headers : {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!responseLogOut.ok){
        alert("cant logout");
        setIsLoggedIn(false);
        localStorage.clear();
        navigate('/');
        return ;
      }
       setTimeout(() => {
          setIsLoggedIn(false);
          setLoading(false);
          navigate('/');
          localStorage.clear();
        }, 1000);
    }
    catch (err){
      alert(err);
    }
  }
  useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const responseMe = await fetch('/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!responseMe.ok) {
        localStorage.clear();
        console.error("Error while fetching info");
        setIsLoggedIn(false);
        return;
      }
      const fetchedUserData = await responseMe.json();
      console.log(fetchedUserData);
      setUserData(fetchedUserData);
      setLoading(false);
      
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

const handleModify = () => {
  if (modify === true)
    setModify(false);
  else
    setModify(true);
}
const avatarUrl = userData.avatar_path && !onError
    ? `http://localhost:5000/${userData.avatar_path}`
    : profilepicture;

  // if (loading) return <Loading duration={400}  showButton={false}/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
          <LeftMenu setIsLoading={setIsLoading}/>
          <div className='profile-wrapper'>
            <div className='profile-picture'>
              <img onError={() => setOnError(true)} src={avatarUrl} className='profilepic' onMouseEnter={handleModify}/>
              {modify && (<>
                <p>Changer l'avatar ?</p>
                  <Button text="Oui" onClick={handleOnClick}/><Button text="Non" onClick={() => setModify(false)}/>
                </>
              )}
            </div>
              <div className='personal-infos-profile'>
                  <h3 className='div-title'>Mes informations personnelles</h3>
                  <h4 className='infos'> <strong>Name        :   </strong> {userData.username} </h4>
                  <h4 className='infos'> <strong>Email        :   </strong> {userData.email} </h4>
                  <h4 className='infos'> <strong>Campus   :   </strong> (// set le campus via 42)</h4>
                  <Button text="Modifier mes infos" onClick={handleOnClick}/>
              </div>
              <BadgeWindow name={userData.username} isLoading={setLoading}/>
              <Button text="Se déconnecter" onClick={handleLogOut}/>
              <br/>
          </div>
          </div>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Profile