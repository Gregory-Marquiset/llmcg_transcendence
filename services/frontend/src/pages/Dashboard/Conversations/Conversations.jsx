import './Conversations.css'
import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading } from '../../../components'
import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom'
import {
  getUserProfile,
  getCurrUserProfile,
} from '../../../functions/user'

function Conversations() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const [userData, setUserData] = useState(null);
  const [CurrUserData, setCurrUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem('access_token');
  const { username } = useParams()
  const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const fetchedCurrUserData = await getCurrUserProfile(accessToken)
        const fetchedUserData = await getUserProfile(username, accessToken)
        setUserData(fetchedUserData)
        setCurrUserData(fetchedCurrUserData)
        setIsLoading(false)

        if (fetchedCurrUserData.id === fetchedUserData.id) {
          navigate('/dashboard/profile')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setIsLoading(false)
        navigate('/dashboard')
      }
    }

    if (accessToken) fetchProfile()
  }, [username, accessToken]);

  // WebSocket connection
  useEffect(() => {
    if (!accessToken || !userData?.id) return;

    setConnectionStatus('connecting');
    const host = window.location.hostname;
    const ws = new WebSocket(`ws://${host}:5000/ws?token=${accessToken}&userId=${CurrUserData.id}`);

    
    ws.onopen = () => {
      console.log("WebSocket connected!");
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message reçu:", event.data);
      if(data.type === "chat:message" && data.payload.fromUserId === userData.id)
        setMessages((prev) => [...prev, {content: `${data.payload.content}`, sender: 'other'} ]);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus('disconnected');
    };
    
    setSocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [accessToken, CurrUserData]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageJson = {
      type: "chat:send",
      requestId: generateRequestId(),
      payload: {
        toUserId: userData.id, // must be set from route or selected conversation
        content: input
      }
    };

      console.log("Envoi du message:", input);
      
      // Ajouter le message envoyé à l'affichage immédiatement
      setMessages((prev) => [...prev, {content :`${input}`, sender:'current'}]);
      
      // Envoyer au serveur
      socket.send(JSON.stringify(messageJson));
      setInput("");
    } else {
      alert("Connection lost. Please refresh the page.");
    }
  };

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
      <div className="Conversations">
        <HeaderBar />
        <LeftMenu setIsLoading={setIsLoading} className="left-menu"/>
        <Background />
        <div className="error-container">
          <h2>Please log in to access the chat</h2>
        </div>
        <Footer />
      </div>
    );
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
                <h1>Chat with ${username}</h1>
                <div className={`connection-status ${connectionStatus}`}>
                  {connectionStatus === 'connected' && '🟢 Connected'}
                  {connectionStatus === 'connecting' && '🟡 Connecting...'}
                  {connectionStatus === 'disconnected' && '🔴 Disconnected'}
                </div>
              </div>
              <div className="chat-box">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
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
                  placeholder="Type your message..."
                  disabled={connectionStatus !== 'connected'}
                />
                <button
                  onClick={sendMessage}
                  disabled={connectionStatus !== 'connected' || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Background>
  </>
);

}

export default Conversations;


