import './Conversations.css'
import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading } from '../../../components'
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import {
  getUserProfile,
  getCurrUserProfile,
} from '../../../functions/user'
import { useWS } from '../../../context/WebSocketContext.jsx'
import { useTranslation } from 'react-i18next'

function Conversations() {
  const { t } = useTranslation()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [userData, setUserData] = useState(null)
  const [CurrUserData, setCurrUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn] = useState(true)

  const messagesEndRef = useRef(null)
  const accessToken = localStorage.getItem('access_token')
  const { username } = useParams()
  const navigate = useNavigate()

  const { status: connectionStatus, isConnected, send, subscribe } = useWS()

  const generateRequestId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5)

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history
  const loadHistory = async (peerId, currentUserId) => {
    try {
      const res = await fetch(`/api/v1/chat/messages/with/${peerId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!res.ok) return

      const history = await res.json()
      if (!Array.isArray(history)) return

      setMessages(
        history.map(msg => ({
          content: msg.content,
          sender: msg.fromUserId === currentUserId ? 'current' : 'other',
          messageId: msg.messageId,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch profiles
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const curr = await getCurrUserProfile(accessToken)
        const other = await getUserProfile(username, accessToken)

        setCurrUserData(curr)
        setUserData(other)

        if (curr.id === other.id) {
          navigate('/dashboard/profile')
          return
        }

        await loadHistory(other.id, curr.id)
      } catch {
        navigate('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) fetchProfile()
  }, [username, accessToken])

  // WebSocket listener
  useEffect(() => {
    if (!userData) return

    const unsubscribe = subscribe(data => {
      if (
        data.type === "chat:message" &&
        data.payload?.fromUserId === userData.id
      ) {
        setMessages(prev => [
          ...prev,
          { content: data.payload.content, sender: 'other' }
        ])

        send({
          type: "chat:delivered",
          payload: { messageId: data.payload.messageId }
        })
      }
    })

    return unsubscribe
  }, [userData, subscribe, send])

  const sendMessage = useCallback(() => {
    if (!input.trim()) return

    if (!isConnected) {
      alert(t('conversations.connection_lost'))
      return
    }

    setMessages(prev => [...prev, { content: input, sender: 'current' }])

    send({
      type: "chat:send",
      requestId: generateRequestId(),
      payload: {
        toUserId: userData.id,
        content: input
      }
    })

    setInput("")
  }, [input, isConnected, userData, send, t])

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) return <Loading />

  if (!isLoggedIn) {
    return (
      <div className="Conversations">
        <HeaderBar />
        <LeftMenu className="left-menu" />
        <Background />
        <div className="error-container">
          <h2>{t('conversations.login_required')}</h2>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <Background>
      <div className="page-wrapper">
        <HeaderBar />
        <div className="core-container">
          <LeftMenu className="left-menu" />
          <div className="content-container">
            <div className="chat-container">
              <div className="chat-header">
                <h1>{t('conversations.title', { username })}</h1>
                <div className={`connection-status ${connectionStatus}`}>
                  {connectionStatus === 'connected' && t('conversations.connected')}
                  {connectionStatus === 'connecting' && t('conversations.connecting')}
                  {connectionStatus === 'disconnected' && t('conversations.disconnected')}
                </div>
              </div>

              <div className="chat-box">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>{t('conversations.no_messages')}</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.sender}`}>
                      <p>{msg.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('conversations.input_placeholder')}
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !input.trim()}
                >
                  {t('conversations.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Background>
  )
}

export default Conversations
