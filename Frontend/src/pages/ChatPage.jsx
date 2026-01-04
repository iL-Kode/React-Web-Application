import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';



const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        setLoading(true);
        setError('');
        const roomData = await chatAPI.getOrCreateRoom(userId);
        setRoom(roomData);
        const messagesData = await chatAPI.getRoomMessages(roomData._id);
        setMessages(messagesData);
      } catch (err) {
        console.error('Error loading chat room:', err);
        setError('Failed to load chat room');
      } finally {
        setLoading(false);
      }
    };
  
    if (userId && user) loadChatRoom();
  }, [userId, user]);
  
  useEffect(() => {
    if (!room || !user) return;
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    socketService.connect(token);
    socketService.joinRoom(room._id);
    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onUserTyping(handleUserTyping);
  
    return () => {
      socketService.leaveRoom(room._id);
      socketService.offReceiveMessage(handleReceiveMessage);
      socketService.offUserTyping(handleUserTyping);
    };
  }, [room?._id, user?.id]);

  const handleReceiveMessage = (data) => {
    const newMsg = {
      _id: Date.now(),
      message: data.message,
      sender: { 
        _id: data.senderId,
        username: data.senderName 
      },
      createdAt: data.timestamp
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleUserTyping = (data) => {
    if (data.userId !== user.id) {
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) { return [...prev, data.userName];}
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;

    try {
      socketService.sendMessage(
        room._id,
        newMessage.trim(),
        user.id,
        user.username
      );
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const getOtherParticipant = () => {
    if (!room) return null;
    return room.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center">Loading chat...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">{error}</div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              ← Tillbaka 
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="chat-container">
            <div className="chat-header">
              <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
                ← Tillbaka 
              </button>
              <h4 className="mb-0">Chatt med {otherParticipant?.username}</h4>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="text-center text-muted">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender._id === user.id || message.sender._id.toString() === user.id;
                  return (
                    <div
                      key={message._id}
                      className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                    >
                      <div className="chat-message-content">
                        <div className="message-text">{message.message}</div>
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <span className="typing-text">
                    {typingUsers.join(', ')}  skriver...
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <form onSubmit={handleSendMessage} className="message-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv något..."
                    className="form-control"
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newMessage.trim()}
                  >
                    Skicka
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
