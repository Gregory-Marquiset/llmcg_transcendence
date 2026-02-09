import './Chat.css'
import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading } from '../../../components'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFriendList, getPresenceForUsers } from '../../../functions/user'
import { profilepicture } from '../../../assets'
import { useWS } from '../../../context/WebSocketContext.jsx'

function formatPreviewTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

function Chat() {
  const accessToken = localStorage.getItem('access_token')
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [presenceMap, setPresenceMap] = useState({})
  const [lastMessages, setLastMessages] = useState({})
  const { subscribe, isConnected } = useWS()

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true)
      try {
        const data = await getFriendList(accessToken)
        setFriends(data)

        if (data && data.length > 0) {
          const friendIds = data.map(f => f.id)
          const presence = await getPresenceForUsers(friendIds, accessToken)
          const statusMap = {}
          Object.keys(presence).forEach(userId => {
            statusMap[userId] = presence[userId]?.status || "offline"
          })
          setPresenceMap(statusMap)
        }

        for (const friend of data) {
          try {
            const res = await fetch(`/api/v1/chat/messages/with/${friend.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.ok) {
              const history = await res.json()
              if (Array.isArray(history) && history.length > 0) {
                const last = history[history.length - 1]
                setLastMessages((prev) => ({
                  ...prev,
                  [friend.id]: {
                    content: last.content,
                    createdAt: last.createdAt || last.clientSentAt,
                    fromUserId: last.fromUserId,
                  }
                }))
              }
            }
          } catch (err) {
            //console.error(`Failed to fetch history for friend ${friend.id}:`, err)
          }
        }
      } catch (err) {
        console.error('Fetch friends error:', err)
      }
      setIsLoading(false)
    }
    if (accessToken) fetchFriends()
  }, [accessToken])

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      if (data.type === "presence:update" && data.userId) {
        setPresenceMap((prev) => ({
          ...prev,
          [data.userId]: data.payload?.status || "offline"
        }))
      }

      if (data.type === "chat:message" && data.payload) {
        const fromId = data.payload.fromUserId
        setLastMessages((prev) => ({
          ...prev,
          [fromId]: {
            content: data.payload.content,
            createdAt: data.payload.createdAt || new Date().toISOString(),
            fromUserId: fromId,
          }
        }))
      }
    })
    return unsubscribe
  }, [subscribe])

  const getStatus = (friendId) => {
    return presenceMap[friendId] || "offline"
  }

  if (isLoading) return <Loading duration={400} showButton={false} />

  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />
          <div className="core-container">
            <LeftMenu setIsLoading={setIsLoading} />
            <div className="content-container">
              <div className="chat-list-container">
                <h3>Messages</h3>
                <div className="chat-ws-status">
                  {isConnected ? "Connected" : "Disconnected"}
                </div>
                {friends.length === 0 ? (
                  <div className="chat-empty">
                    <p>Add friends to start chatting!</p>
                  </div>
                ) : (
                  <div className="chat-friend-list">
                    {friends.map((friend) => (
                      <ChatFriendCard
                        key={friend.id}
                        friend={friend}
                        status={getStatus(friend.id)}
                        lastMessage={lastMessages[friend.id] || null}
                        onClick={() => navigate(`/users/${friend.username}/chat`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </Background>
    </>
  )
}

function ChatFriendCard({ friend, status, lastMessage, onClick }) {
  const [onError, setOnError] = useState(false)
  const avatarUrl = friend.avatar_path
      ? `/app/users/uploads/${friend.avatar_path}`
      : profilepicture;

  const previewText = lastMessage
    ? (lastMessage.content.length > 40
      ? lastMessage.content.substring(0, 40) + '...'
      : lastMessage.content)
    : 'No messages yet';

  return (
    <div className="chat-friend-card" onClick={onClick}>
      <div className="chat-friend-avatar-wrapper">
        <img src={onError ? profilepicture : avatarUrl} className='profilepic' onError={() => setOnError(true)} />
        <span className={`chat-presence-dot ${status}`} />
      </div>
      <div className="chat-friend-info">
        <div className="chat-friend-top-row">
          <span className="chat-friend-name">{friend.username}</span>
          {lastMessage?.createdAt && (
            <span className="chat-friend-time">{formatPreviewTime(lastMessage.createdAt)}</span>
          )}
        </div>
        <span className="chat-friend-preview">{previewText}</span>
      </div>
    </div>
  )
}

export default Chat
