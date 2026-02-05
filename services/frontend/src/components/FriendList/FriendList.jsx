import { getFriendList } from '../../functions/user'
import { Error401, Error404 } from '../../pages'
import FriendCard from './FriendCard'
import './FriendList.css'
import { useState, useEffect } from 'react'

function FriendList({ refresh }) {
  const accessToken = localStorage.getItem('access_token')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(0)
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true)
      try {
        const data = await getFriendList(accessToken)
        setFriends(data)
        setLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchFriends()
  }, [accessToken, refresh])

  return (
    <div className="friend-list-container">
      <h3> Number of friends : {friends.length}</h3>
      <div className="friend-list">
        {friends.map(friend => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  )
}

export default FriendList
