import './FriendList.css'
import { useNavigate } from 'react-router-dom'
import { profilepicture } from '../../assets'
import { respondToFriendRequest } from '../../functions/user'
import { Button }from '../'
import { useState} from 'react'
import { useTranslation } from 'react-i18next'

function RequestCard({ request, onActionDone }) {
  const accessToken = localStorage.getItem('access_token')
  const navigate = useNavigate()
  const [onError, setOnError] = useState(false)
  const { t } = useTranslation()
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
  const avatarUrl = request.avatar_path && !onError
    ? `http://${host}:5000/${request.avatar_path}`
    : profilepicture;
return (
  <div className="friend-card" onClick={handleClick}>
    <img
      src={avatarUrl}
      onError={() => setOnError(true)}
      alt={request.username}
    />
    <h3>{request.username}</h3>

    <Button
      text={t("user.accept")}
      onClick={(e) => {
        e.stopPropagation();
        handleAcceptRequest();
      }}
    />

    <Button
      text={t("user.refuse")}
      onClick={(e) => {
        e.stopPropagation();
        handleRefuseRequest();
      }}
    />
  </div>
)

}

export default RequestCard
