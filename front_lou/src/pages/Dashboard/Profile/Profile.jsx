import '../../../styles/App.css'
import { LogTitle, Footer, Background, HeaderBar, LeftMenu} from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { AuthProvider } from '../../../context/AuthContext'
function Profile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      email: '',
      avatar_path: '',
      createdAt: ''
  });
  useEffect(() => {
    const fetchProfile = async () => {
    try {
            const reponse = await fetch('http://localhost:5000/api/v1/auth/me', {
                method : 'GET',
                headers :{
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (reponse.ok){
                const data = await reponse.json();
                console.log(data.avatar_path);
                setUserData(data);
            }
        }
        catch (err){
            console.error('Erreur :', err)
        }
      }
  fetchProfile()
     }, []);
     if (!userData.avatar_path){
      setUserData({
        ...userData,
        avatar_path : profilepicture
      })
     }
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
                <h3>Mes informations personnelles</h3>
                <br/>
                <h4>{userData.username}</h4>
                <br/>
                <h4>Since :{userData.createdAt}</h4>
              </div>
              <div className='personal-infos'>
                  Mes badges
              </div>
          </div>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Profile