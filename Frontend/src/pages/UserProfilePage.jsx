import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, messagesAPI } from '../services/api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = await userAPI.getUserById(userId);
      setProfileUser(userData);
      
      const messagesData = await messagesAPI.getMessagesForUser(userId);
      setMessages(messagesData);
    } catch (err) {
      setError('Inte vänner');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await messagesAPI.postMessage(newMessage.trim(), userId);
      setNewMessage('');
      
      const newMessageObj = {
        _id: Date.now(),
        text: newMessage.trim(),
        author: { username: user.username },
        createdAt: new Date().toISOString()
      };
      setMessages(prevMessages => [newMessageObj, ...prevMessages]);
    } catch (err) {
      setError('Kunde inte lägga upp meddelande eftersom ni inte är vänner');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="error">Kunde inte hitta användare</div>;
  }

  const isOwnProfile = user && user.id === userId;

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="profile-header">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
              ← Tillbaka
            </button>
            <h1 className="text-center">{profileUser.username}</h1>
            {isOwnProfile && <span className="own-page-badge">Din sida</span>}
            {!isOwnProfile && (
              <button
                onClick={() => navigate(`/chat/${userId}`)}
                className="btn btn-success btn-sm"
              >
                Chatt
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {!isOwnProfile && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Lägg upp något</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePostMessage}>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={'skriv något...'}
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
          )}

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Inlägg</h5>
            </div>
            <div className="card-body">
              {messages.length === 0 ? (
                <p className="text-muted">Inga inlägg.</p>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="message">
                    <div className="message-header">
                      <span className="author">{message.author.username}</span>
                      <span className="timestamp">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
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

export default UserProfilePage;
