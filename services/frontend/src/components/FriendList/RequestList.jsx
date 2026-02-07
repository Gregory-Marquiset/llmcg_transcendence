import { getRequestList } from '../../functions/user'
import RequestCard from './RequestCard'
import './FriendList.css'
import { useState, useEffect } from 'react'
import { Error401, Error404 } from '../../pages'
import { useTranslation } from 'react-i18next'

function RequestList({ refresh, onActionDone }) {
  const { t } = useTranslation()	
  const accessToken = localStorage.getItem('access_token')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
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
  }, [accessToken, refresh])

  return (
    <div className="friend-list-container">
      <h3> {t("user.number_request")} : {requests.length}</h3>
      <div className="friend-list">
        {requests.map(request => (
          <RequestCard key={request.id} request={request} onActionDone={onActionDone}/>
        ))}
      </div>
    </div>
  )
}

export default RequestList
