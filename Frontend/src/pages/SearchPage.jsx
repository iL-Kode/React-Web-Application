import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, friendsAPI } from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const data = await userAPI.searchUsers(query);
      setUsers(data);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      setError('Friend request sent!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send friend request');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">Sök användare</h1>
          
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Sök efter användare..."
                    required
                  />
                  <button type="submit" className="btn btn-primary">{'Sök'} </button>
                </div>
              </form>
            </div>
          </div>

          {error && <div className="alert alert-dark">{error}</div>}

          {users.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Sökresultat</h5>
              </div>
              <div className="card-body">
                {users.map((user) => (
                  <div key={user._id} className="user-card">
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={() => navigate(`/user/${user._id}`)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Se profil
                      </button>
                      <button 
                        onClick={() => handleSendRequest(user._id)}
                        className="btn btn-success btn-sm"
                      >
                        Lägg till vän
                      </button>
                      <button
                        onClick={() => navigate(`/chat/${user._id}`)}
                        className="btn btn-outline-dark"
                      >
                        Chatt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
