import { getFriendList, getPresenceForUsers } from '../../functions/user'
import { Error401, Error404 } from '../../pages'
import FriendCard from './FriendCard'
import './FriendList.css'
import { useState, useEffect } from 'react'

function FriendList({ refresh, presenceMap = {}, isWSConnected = false }) {
  const accessToken = localStorage.getItem('access_token')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(0)
  const [initialPresence, setInitialPresence] = useState({})

  // Charger la liste des amis
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true)
      try {
        const data = await getFriendList(accessToken)
        setFriends(data)
        setLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
        setLoading(false)
      }
    }
    fetchFriends()
  }, [accessToken, refresh])

  // Charger la présence SEULEMENT quand le WebSocket est connecté
  // Cela évite de charger la présence pendant la reconnexion
  useEffect(() => {
    const loadPresence = async () => {
      if (friends.length > 0 && isWSConnected) {
        const friendIds = friends.map(f => f.id)
        const presence = await getPresenceForUsers(friendIds, accessToken)
        setInitialPresence(presence)
      }
    }
    loadPresence()
  }, [friends, isWSConnected, accessToken])

  // Merger la présence initiale avec les mises à jour WebSocket
  // presenceMap du WebSocket contient des strings "online"/"offline"
  // initialPresence de l'API contient des objets { status: "online", ... }
  const getStatus = (friendId) => {
    // Priorité au WebSocket (temps réel)
    if (presenceMap[friendId]) {
      return presenceMap[friendId]
    }
    // Sinon utiliser la présence initiale de l'API
    if (initialPresence[friendId]) {
      return initialPresence[friendId].status || "offline"
    }
    return "offline"
  }

  return (
    <div className="friend-list-container">
      <h3> Number of friends : {friends.length}</h3>
      <div className="friend-list">
        {friends.map(friend => (
          <FriendCard key={friend.id} friend={friend} status={getStatus(friend.id)} />
        ))}
      </div>
    </div>
  )
}

export default FriendList
