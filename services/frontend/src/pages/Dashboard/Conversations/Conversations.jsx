import './Conversations.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading } from '../../../components'
import { useState, useEffect, useRef } from "react";

function Conversations() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem('access_token');

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const responseMe = await fetch('/api/v1/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!responseMe.ok) {
          localStorage.clear();
          console.error("Error while fetching info");
          setIsLoggedIn(false);
          return;
        }
        
        const fetchedUserData = await responseMe.json();
        console.log(fetchedUserData);
        setUserData(fetchedUserData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

  // WebSocket connection
  useEffect(() => {
    if (!accessToken || !userData?.id) return;

    setConnectionStatus('connecting');
    const host = window.location.hostname;
    const ws = new WebSocket(`ws://${host}:5000/ws?token=${accessToken}&userId=${userData.id}`);

    
    ws.onopen = () => {
      console.log("WebSocket connected!");
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      console.log("Message reçu:", event.data);
      setMessages((prev) => [...prev, event.data]);
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
  }, [accessToken, userData]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Envoi du message:", input);
      
      // Ajouter le message envoyé à l'affichage immédiatement
      setMessages((prev) => [...prev, `Moi: ${input}`]);
      
      // Envoyer au serveur
      socket.send(input);
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

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="Conversations">
        <HeaderBar />
        <LeftMenu />
        <Background />
        <div className="error-container">
          <h2>Please log in to access the chat</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="Conversations">
      <HeaderBar />
      <LeftMenu />
      <Background />
      
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat</h1>
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
              <div key={i} className="message">
                <p>{msg}</p>
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
      
      <Footer />
    </div>
  );
}

export default Conversations;