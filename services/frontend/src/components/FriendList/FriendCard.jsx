import './FriendList.css'
import { useNavigate } from 'react-router-dom'
import { profilepicture } from '../../assets'
import { useState} from 'react'

function FriendCard({ friend }) {
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  const handleClick = () => {
    navigate(`/users/${friend.username}/profile`)
  }

  const avatarUrl = friend.avatar_path && !onError
    ? `http://localhost:5000/uploads/avatar/${friend.avatar_path}`
    : profilepicture;

  return (
    <div className="friend-card" onClick={handleClick}>
      <img src={avatarUrl} onError={() => setOnError(true)} alt={FriendCard.username} />  
      <h3>{friend.username}</h3>
    </div>
  )
}

export default FriendCard
