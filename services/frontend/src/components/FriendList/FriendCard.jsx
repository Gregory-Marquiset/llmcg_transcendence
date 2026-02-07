import './FriendList.css'
import { useNavigate } from 'react-router-dom'
import { profilepicture } from '../../assets'
import { useState} from 'react'
import { Button }from '../'
 
function FriendCard({ friend }) {
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  const handleClick = () => {
    navigate(`/users/${friend.username}/profile`)
  }

  const handleChat = () => {
    navigate(`/users/${friend.username}/chat`)
  }
  const host = window.location.hostname;
  const avatarUrl = friend.avatar_path && !onError
    ? `http://${host}:5000/${friend.avatar_path}`
    : profilepicture;

  return (
    <div className="friend-card" onClick={handleClick}>
      <img src={avatarUrl} onError={() => setOnError(true)} alt={FriendCard.username} />  
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
