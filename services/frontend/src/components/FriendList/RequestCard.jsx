import './FriendList.css'
import { useNavigate } from 'react-router-dom'
import { profilepicture } from '../../assets'
import { respondToFriendRequest } from '../../functions/user'
import { Button }from '../'
import { useState} from 'react'

function RequestCard({ request, onActionDone }) {
  const accessToken = localStorage.getItem('access_token')
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  
  const handleClick = () => {
    navigate(`/users/${request.username}/profile`)
  }

  const handleAcceptRequest = async () => {
    try {
      await respondToFriendRequest(request.id,'accept', accessToken)
      onActionDone()
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }

  const handleRefuseRequest = async () => {
    try {
      await respondToFriendRequest(request.id,'refuse', accessToken)
      onActionDone()
    } catch (err) {
      console.error('Failed to accept request:', err)
    }
  }
  const host = window.location.hostname;
  const avatarUrl = request.avatar_path
      ? `/app/users/uploads/${request.avatar_path}`
      : profilepicture;
  console.log(avatarUrl)
return (
  <div className="friend-card" onClick={handleClick}>
    <img src={onError ? profilepicture : avatarUrl} className='profilepic' onError={() => setOnError(true)} />
    <h3>{request.username}</h3>

    <Button
      text="Accepter"
      onClick={(e) => {
        e.stopPropagation();
        handleAcceptRequest();
      }}
    />

    <Button
      text="Refuser"
      onClick={(e) => {
        e.stopPropagation();
        handleRefuseRequest();
      }}
    />
  </div>
)

}

export default RequestCard
