import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../services/api';

const HomePage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMessages();
  }, []);

  const getMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesAPI.getMessagesForUser(user.id);
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await messagesAPI.postMessage(newMessage.trim(), user.id);
      setNewMessage('');
      
      const newMsg = {
        _id: Date.now(),
        text: newMessage.trim(),
        author: {username: user.username},
        createdAt: new Date().toISOString()
      };
      setMessages(prevMessages => [newMsg, ...prevMessages]);
    } catch (err) {
      setError('Failed to post message');
    }
  };

  if (loading) {
    return <div className="loading">Loading your page...</div>;
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">Din profil</h1>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Skriv något</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Vad har du på hjärtat?"
                    maxLength="140"
                    rows="3"
                  />
                  <div className="char-count">
                    {newMessage.length}/140
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                 Skicka 
                </button>
              </form>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Dina inlägg</h5>
            </div>
            <div className="card-body">
              {messages.length === 0 ? (
                <p className="text-muted">Inga inlägg!</p>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="message">
                    <div className="message-header">
                      <span className="author">{message.author.username}</span>
                    </div>
                    <div className="message-content">{message.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
