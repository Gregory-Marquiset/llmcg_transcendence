import '../../../styles/App.css'
import { LogTitle, Footer, Background, HeaderBar, LeftMenu, Button} from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      twofa_enabled: ''
  });
  const navigate = useNavigate();
  const [modify, setModify] = useState(false);
    const {
          accessToken
        } = useAuth();
  const handleOnClick = () =>  navigate("/dashboard/profile/modify");
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const responseMe = await fetch('/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!responseMe.ok) {
        console.error("Error while fetching info");
        return;
      }
      const fetchedUserData = await responseMe.json();
      console.log(fetchedUserData);
      setUserData({
        ...fetchedUserData,
        avatar_path: profilepicture || fetchedUserData.avatar_path 
      });
      
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          {/* <LogTitle text="Mon profil"/> */}
          <div className='profile-wrapper'>
            <div className='profile-picture'>
              <img src={profilepicture || userData.avatar_path} className='profilepic'/>
            </div>
              <div className='personal-infos'>
                  <h3 className='div-title'>Mes informations personnelles</h3>
                  <h4 className='infos'> <strong>Name        :   </strong>  {userData.username}</h4>
                  <h4 className='infos'> <strong>Email        :   </strong> {userData.email}</h4>
                  <h4 className='infos'> <strong>Campus   :   </strong> (// set le campus via 42)</h4>
                  <Button text="Modifier mes infos" onClick={handleOnClick}/>
              </div>
              <div className='personal-infos'>
                  <h3 className='div-title'>Mes badges</h3>
              </div>
          </div>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Profile