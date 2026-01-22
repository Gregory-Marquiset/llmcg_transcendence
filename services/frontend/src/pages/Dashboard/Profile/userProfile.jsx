import '../../../styles/App.css'
import { Footer, Background, HeaderBar, Button, Loading } from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import BadgeWindow from './BadgeWindow'

function userProfile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      avatar_path: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [onError, setOnError] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const { username } = useParams();

  const handleAddFriend = async () => {
    try {
      const responseAddFriend = await fetch(`/api/v1/users/friends/${userData.id}/request`, {
        method : 'POST',
        headers : {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      console.log(data);
    }
    catch (err){
      alert(err);
    }
  }

  const handleBlock = async () => {
    try {
      const responseAddFriend = await fetch(`/api/v1/users/friends/${userData.id}/block`, {
        method : 'POST',
        headers : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      console.log(data);
    }
    catch (err){
      alert(err);
    }
  }

  useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const responseMe = await fetch(`/api/v1/users/user/${username}/profil`, {
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


const avatarUrl = userData.avatar_path && !onError
    ? `http://localhost:5000/uploads/avatar/${userData.avatar_path}`
    : profilepicture;

  if (loading) return <Loading duration={400}  showButton={false}/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='profile-wrapper'>
            <div className='profile-picture'>
              <img onError={() => setOnError(true)} src={avatarUrl} className='profilepic'/>
            </div>
              <div className='personal-infos-profile'>
                  <h3 className='div-title'>informations</h3>
                  <h4 className='infos'> <strong>Name        :   </strong> {userData.username} </h4>
                  <h4 className='infos'> <strong>Campus   :   </strong> (// set le campus via 42)</h4>
              </div>
              <BadgeWindow name={userData.username}/>
              <Button text="Ajouter en ami" onClick={handleAddFriend}/>
              <Button text="Bloquer" onClick={handleBlock}/>
              <br/>
          </div>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default userProfile