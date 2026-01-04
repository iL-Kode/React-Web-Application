import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await chatAPI.getUserRooms();
      setRooms(roomsData);
    } catch (err) {
      setError('Failed to load chats');
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (room) => {
    return room.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div className="text-center">Loading chats...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Dina chattar</h1>

          {error && <div className="alert alert-dark">{error}</div>}

          {rooms.length === 0 ? (
            <div className="card">
              <div className="card-body text-center">
                <h5 className="mt-3">Inga chattar</h5>
              </div>
            </div>
          ) : (
            <div>
              {rooms.map((room) => {
                const otherParticipant = getOtherParticipant(room);
                return (
                  <div
                    key={room._id}
                    className="chat-room-card"
                    onClick={() => navigate(`/chat/${otherParticipant._id}`)}
                  >
                      <div className="chat-room-info">
                      <h6 className="chat-room-name">{otherParticipant.username}</h6>
                      <p className="chat-room-preview">klicka för att chatta</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;
