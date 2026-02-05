import '../../../styles/App.css'
import {
  Footer,
  Background,
  HeaderBar,
  Button,
  Loading,
} from '../../../components'
import './Profile.css'
import { useState, useEffect } from 'react'
import { profile, profilepicture } from '../../../assets'
import { useAuth } from '../../../context/AuthContext'
import {
  addFriend,
  deleteFriend,
  blockUser,
  unblockUser,
  getUserProfile,
  getCurrUserProfile,
  respondToFriendRequest
} from '../../../functions/user'
import { useNavigate, useParams } from 'react-router-dom'
import { badges, starBadge } from '../../../badges/badges'

function computeBadgeProgress(badge, statValue) {
  const levels = badge.levels;

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (statValue >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }
  if (currentLevel === levels.length - 1) {
    return { level: currentLevel, progress: 100 };
  }
  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold = levels[currentLevel + 1].threshold;

  const progress =
    ((statValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return {
    level: currentLevel,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

function UserProfile() {
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    avatar_path: '',
    friendshipsStatus: '',
    blockedBy: null,
  })
  const [CurrUserData, setCurrUserData] = useState({
    id: '',
    username: '',
    avatar_path: '',
    friendshipsStatus: '',
    blockedBy: null,
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  const accessToken = localStorage.getItem('access_token')
  const { username } = useParams()

  const handleAddFriend = async () => {
    try {
      await addFriend(userData.id, accessToken)
      setUserData(prev => ({ ...prev, friendshipsStatus: 'pending' }))
    } catch (err) {
      console.error('Failed to add friend:', err)
    }
  }

  const handleDeleteFriend = async () => {
    try {
      await deleteFriend(userData.id, accessToken)
      setUserData(prev => ({ ...prev, friendshipsStatus: '' }))
    } catch (err) {
      console.error('Failed to delete friend:', err)
    }
  }

  const handleBlockUser = async () => {
    try {
      await blockUser(userData.id, accessToken)
      setUserData(prev => ({
        ...prev,
        blockedBy: CurrUserData.id,
        friendshipsStatus: 'blocked',
      }))
    } catch (err) {
      console.error('Failed to block user:', err)
    }
  }

  const handleUnblockUser = async () => {
    try {
      await unblockUser(userData.id, accessToken)
      setUserData(prev => ({ ...prev, blockedBy: 0, friendshipsStatus: '' }))
    } catch (err) {
      console.error('Failed to unblock user:', err)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const fetchedCurrUserData = await getCurrUserProfile(accessToken)
        const fetchedUserData = await getUserProfile(username, accessToken)
        setUserData(fetchedUserData)
        setCurrUserData(fetchedCurrUserData)
        setLoading(false)

        if (fetchedCurrUserData.id === fetchedUserData.id) {
          navigate('/dashboard/profile')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setLoading(false)
        navigate('/dashboard')
      }
    }

    if (accessToken) fetchProfile()
  }, [username, accessToken])

  const avatarUrl =
    userData.avatar_path && !onError
      ? `http://localhost:5000/uploads/avatar/${userData.avatar_path}`
      : profilepicture

      ///
       const computedBadges = badges.map((badge) => {
        const statValue = userData.stats?.[badge.key] ?? 0;
        const {level, progress} = computeBadgeProgress(badge, statValue);
        return {
            ...badge,
            level,
            progress
        };
    });
      ///
  if (loading) return <Loading duration={400} showButton={false} />
if (userData.blockedBy === CurrUserData.id) {
  return (
    <Background>
      <div className="page-wrapper">
        <HeaderBar />
        <div className="profile-wrapper">
          <h3>{userData.username} vous a bloqué</h3>
        </div>
        <Footer />
      </div>
    </Background>
  )
}


  if (userData.blockedBy === userData.id) {
    return (
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className="profile-wrapper">
            <h3>Vous avez bloqué {userData.username}</h3>
            <Button text="Débloquer" onClick={handleUnblockUser} />
          </div>
          <Footer />
        </div>
      </Background>
    )
  }
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className="profile-wrapper">
            <div className="profile-picture">
              <img
                onError={() => setOnError(true)}
                src={avatarUrl}
                className="profilepic"
              />
            </div>
            <div className="personal-infos-profile">
              <h3 className="div-title">informations</h3>
              <h4 className="infos">
                {' '}
                <strong>Name : </strong> {userData.username}{' '}
              </h4>
              <h4 className="infos">
                {' '}
                <strong>Campus : </strong> (// set le campus via 42)
              </h4>
            </div>
            <div className='badge-wrapper'>
            {computedBadges.map((type, index) => {
                return (
                    <div key={type.name} className='badge-container'>
                            <img 
                                className='badge'
                                src={type.levels[type.level].path}
                                alt={`${type.name} - ${type.description}`}
                            />
                        <div 
                            className="badge-progress-container"
                            style={{ borderColor: '#eab2bb'}}>
                            <div 
                                className="badge-progress-fill"
                                style={{ 
                                    width: `${type.progress}%`,
                                    backgroundColor: type.color 
                                }}
                            />
                        </div>
                        <br/>
                        <div className="badge-name">{type.name}</div>
                    </div>
                );
            })}
        </div>
            {userData.friendshipsStatus !== 'pending' &&
              userData.friendshipsStatus !== 'accepted' &&
              userData.friendshipsStatus !== 'blocked' && (
                <Button text="Ajouter en ami" onClick={handleAddFriend} />
              )}
            {(userData.friendshipsStatus === 'accepted') && (
              <Button text="Supprimer un ami" onClick={handleDeleteFriend} />
            )}
            {userData.blockedBy === 0 && (
              <Button text="Bloquer" onClick={handleBlockUser} />
            )}
            <br />
          </div>
        </div>
        <Footer />
      </Background>
    </>
  )
}

export default UserProfile
