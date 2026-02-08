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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [userData, setUserData] = useState(null);
  const [CurrUserData, setCurrUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem('access_token');
  const { username } = useParams();
  const navigate = useNavigate();

  const { status: connectionStatus, isConnected, send, subscribe } = useWS();

  const generateRequestId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from API
  const loadHistory = async (peerId, currentUserId) => {
    try {
      const res = await fetch(`/api/v1/chat/messages/with/${peerId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!res.ok) {
        console.error('Failed to load history:', res.status)
        return
      }
      const history = await res.json()
      if (!Array.isArray(history)) return

      const mapped = history.map((msg) => ({
        content: msg.content,
        sender: msg.fromUserId === currentUserId ? 'current' : 'other',
        messageId: msg.messageId,
      }))
      setMessages(mapped)
    } catch (err) {
      console.error('Load history error:', err)
    }
  }

  // Fetch user profile + load history
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const fetchedCurrUserData = await getCurrUserProfile(accessToken)
        const fetchedUserData = await getUserProfile(username, accessToken)
        setUserData(fetchedUserData)
        setCurrUserData(fetchedCurrUserData)

        if (fetchedCurrUserData.id === fetchedUserData.id) {
          navigate('/dashboard/profile')
          return
        }

        // Load message history
        await loadHistory(fetchedUserData.id, fetchedCurrUserData.id)

        setIsLoading(false)
      } catch (err) {
        console.error('Fetch error:', err)
        setIsLoading(false)
        navigate('/dashboard')
      }
    }

    if (accessToken) fetchProfile()
  }, [username, accessToken]);

  // Listen for incoming chat messages
  useEffect(() => {
    if (!userData) return;

    const unsubscribe = subscribe((data) => {
      if (data.type === "chat:message" && data.payload?.fromUserId === userData.id) {
        setMessages((prev) => [...prev, { content: data.payload.content, sender: 'other' }]);

        // Mark message as delivered
        send({
          type: "chat:delivered",
          payload: { messageId: data.payload.messageId }
        });
      }
    });

    return unsubscribe;
  }, [userData, subscribe, send])

  const sendMessage = useCallback(() => {
    if (!input.trim()) return

    if (!isConnected) {
      alert(t('conversations.connection_lost'))
      return;
    }

    const messageJson = {
      type: "chat:send",
      requestId: generateRequestId(),
      payload: {
        toUserId: userData.id,
        content: input
      }
    };

    //console.log("Envoi du message:", input);

    // Ajouter le message envoye a l'affichage immediatement
    setMessages((prev) => [...prev, { content: input, sender: 'current' }]);

    // Envoyer au serveur
    send(messageJson);
    setInput("");
  }, [input, isConnected, userData, send]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="core-container">
        <HeaderBar />
        <LeftMenu setIsLoading={setIsLoading} className="left-menu"/>
        <Background />
        <div className="error-container">
          <h2>{t('conversations.login_required')}</h2>
        </div>
        <Footer />
      </div>
    )
  }

return (
  <>
    <Background>
      <div className="page-wrapper">
        <HeaderBar />
        <div className="core-container">
          <LeftMenu setIsLoading={setIsLoading} className="left-menu"/>
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
                  onChange={(e) => setInput(e.target.value)}
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
  </>
)

}

export default Conversations;
