import '../../../styles/App.css'
import { Footer, Background, HeaderBar, Button, Loading } from '../../../components'
import './Profile.css' 
import { useState, useEffect } from 'react'
import { profilepicture } from '../../../assets'
import { addFriend, deleteFriend, blockUser, unblockUser, getUserProfile, getCurrUserProfile} from '../../../functions/user'
import { useNavigate, useParams } from 'react-router-dom'
import BadgeWindow from './BadgeWindow'


function userProfile() {
  const [userData, setUserData] = useState ({
      id: '',
      username: '',
      avatar_path: '',
	  friendshipsStatus: '',
	  blockedBy: null,
  });
  const [CurrUserData, setCurrUserData] = useState ({
      id: '',
      username: '',
      avatar_path: '',
	  friendshipsStatus: '',
	  blockedBy: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [onError, setOnError] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const { username } = useParams();


    const handleAddFriend = async () => {
    try {
      await addFriend(userData.id, accessToken);
      setUserData(prev => ({ ...prev, friendshipsStatus: 'pending' }));
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  };

  const handleDeleteFriend = async () => {
    try {
      await deleteFriend(userData.id, accessToken);
      setUserData(prev => ({ ...prev, friendshipsStatus: '' }));
    } catch (err) {
      console.error('Failed to delete friend:', err);
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser(userData.id, accessToken);
      setUserData(prev => ({ ...prev, blockedBy: CurrUserData.id, friendshipsStatus: 'blocked' }));
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleUnblockUser = async () => {
    try {
      await unblockUser(userData.id, accessToken);
      setUserData(prev => ({ ...prev, blockedBy: 0,  friendshipsStatus: '' }));
    } catch (err) {
      console.error('Failed to unblock user:', err);
    }
  };


  useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const fetchedCurrUserData = await getCurrUserProfile(accessToken);
      const fetchedUserData = await getUserProfile(username, accessToken);
      setUserData(fetchedUserData);
      setCurrUserData(fetchedCurrUserData);
      setLoading(false);

      if (fetchedCurrUserData.id === fetchedUserData.id) {
        navigate("/dashboard/profile");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  if (accessToken) fetchProfile();
}, [username, accessToken]);


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
              {userData.friendshipsStatus !== "pending" && userData.friendshipsStatus !== "accepted" && userData.friendshipsStatus !== "blocked" && (
                <Button text="Ajouter en ami" onClick={handleAddFriend}/>
              )}
              {(userData.friendshipsStatus === "pending" || userData.friendshipsStatus === "accepted") && (
                <Button text="Supprimer un ami" onClick={handleDeleteFriend}/>
              )}
              {userData.blockedBy === 0 && (
                <Button text="Bloquer" onClick={handleBlockUser}/>
              )}
              {userData.blockedBy !== 0 && userData.blockedBy !== userData.id && (
                <Button text="De-Bloquer" onClick={handleUnblockUser}/>
              )}
              <br/>
          </div>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default userProfile