import './FriendList.css'
import { useNavigate } from 'react-router-dom'
import { profilepicture } from '../../assets'
import { useState} from 'react'
import { Button }from '../'

function FriendCard({ friend, status = "offline" }) {
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  const handleClick = () => {
    navigate(`/users/${friend.username}/profile`)
  }

  const handleChat = () => {
    navigate(`/users/${friend.username}/chat`)
  }
  const host = window.location.hostname;
  const avatarUrl = friend.avatar_path
      ? `/app/users/uploads/${friend.avatar_path}`
      : profilepicture;

  return (
    <div className="friend-card" onClick={handleClick}>
      <div className="friend-avatar-wrapper">
        <img src={onError ? profilepicture : avatarUrl} className='profilepic' onError={() => setOnError(true)}/> 
        <span className={`friend-presence-dot ${status}`} />
      </div> 
      <h3>{friend.username}</h3>
        <Button
            text="Chat"
            onClick={(e) => {
              e.stopPropagation();
              handleChat();
            }}
        />
    </div>
  )
}

export default FriendCard
