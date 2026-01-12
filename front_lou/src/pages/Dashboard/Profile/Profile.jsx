import '../../../styles/App.css'
import { LogTitle, Footer, Background, HeaderBar, LeftMenu} from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'

function Profile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      twofa_enabled: ''
  });
    const { authUser,
          setAuthUser,
          isLoggedIn,
          setIsLoggedIn,
          accessToken,
          setAccessToken
        } = useAuth();
  
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
        console.error("Error fetching info");
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
          <LogTitle text="Mon profil"/>
          <div className='profile-wrapper'>
            <div className='profile-picture'>
              <img src={userData.avatar_path} className='profilepic'/>
            </div>
              <div className='personal-infos'>
                <h3 className='div-title'>Mes informations personnelles</h3>
                <h4 className='infos'> Name : {userData.username}</h4>
                <h4 className='infos'> Email : {userData.email}</h4>
                <h4 className='infos'> Campus : (// set le campus via 42)</h4>
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