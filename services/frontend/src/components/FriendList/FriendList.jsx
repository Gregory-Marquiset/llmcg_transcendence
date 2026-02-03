import { getFriendList } from '../../functions/user'
import FriendCard from './FriendCard'
import './FriendList.css'
import { useState, useEffect } from 'react'

function FriendList() {
  const accessToken = localStorage.getItem('access_token')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  //     const friends = [
  //   { id: 1, username: 'Alice', avatar_path: 'https://i.pravatar.cc/150?img=1' },
  //   { id: 2, username: 'Bob', avatar_path: 'https://i.pravatar.cc/150?img=2' },
  //   { id: 3, username: 'Charlie', avatar_path: 'https://i.pravatar.cc/150?img=3' },
  //   { id: 4, username: 'Diana', avatar_path: 'https://i.pravatar.cc/150?img=4' }
  //     ];
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
  }, [accessToken])

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
