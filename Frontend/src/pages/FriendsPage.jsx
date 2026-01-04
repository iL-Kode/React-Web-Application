import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FriendsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, pendingData] = await Promise.all([
        friendsAPI.getFriends(),
        friendsAPI.getPendingRequests()
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
    } catch (err) {
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptFriendRequest(requestId);
      setError('Vänner!');
      loadFriendsData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsAPI.rejectFriendRequest(requestId);
      setError('Friend request rejected');
      loadFriendsData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  if (loading) {
    return <div className="loading">Laddar...</div>;
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">Vänner</h1>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Förfrågningar</h5>
            </div>
            <div className="card-body">
              {pendingRequests.length === 0 ? (
                <p className="text-muted">Inga förfrågningar</p>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request._id} className="friend-request">
                    <div className="request-info">
                      <span className="username">{request.requester.username}</span>
                      <span className="timestamp">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="request-actions">
                      <button 
                        onClick={() => handleAcceptRequest(request._id)}
                        className="btn btn-success btn-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(request._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Dina Vänner</h5>
            </div>
            <div className="card-body">
              {friends.length === 0 ? (
                <p className="text-muted">Inte vänner!</p>
              ) : (
                friends.map((friendship) => {
                  const friend = (friendship.requester._id === user.id || 
                                 friendship.requester._id.toString() === user.id) ? 
                    friendship.recipient : friendship.requester;
                  
                  return (
                    <div key={friendship._id} className="friend-card">
                      <div className="friend-info">
                        <span className="username">{friend.username}</span>
                        <br />
                      </div>
              <div className="friend-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/user/${friend._id}`)}
                >
                  Besök Sida
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate(`/chat/${friend._id}`)}
                >
                  Chatt
                </button>
              </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
