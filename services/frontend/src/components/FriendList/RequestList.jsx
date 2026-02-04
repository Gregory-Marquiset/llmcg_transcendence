import { getRequestList } from '../../functions/user'
import RequestCard from './RequestCard'
import './FriendList.css'
import { useState, useEffect } from 'react'

function RequestList() {
  const accessToken = localStorage.getItem('access_token')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  //     const friends = [
  //   { id: 1, username: 'Alice', avatar_path: 'https://i.pravatar.cc/150?img=1' },
  //   { id: 2, username: 'Bob', avatar_path: 'https://i.pravatar.cc/150?img=2' },
  //   { id: 3, username: 'Charlie', avatar_path: 'https://i.pravatar.cc/150?img=3' },
  //   { id: 4, username: 'Diana', avatar_path: 'https://i.pravatar.cc/150?img=4' }
  //     ];
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const data = await getRequestList(accessToken)
        setRequests(data)
        setLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchRequests()
  }, [accessToken])

  return (
    <div className="friend-list-container">
      <h3> Number of request pending : {requests.length}</h3>
      <div className="friend-list">
        {requests.map(request => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  )
}

export default RequestList
