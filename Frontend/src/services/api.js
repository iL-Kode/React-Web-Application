import axios from 'axios';

const baseURL = '/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(

  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(

  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {

  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const userAPI = {

  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const friendsAPI = {
    
  sendFriendRequest: async (recipientId) => {
    const response = await api.post('/friends/request', { recipientId });
    return response.data;
  },
  
  getFriends: async () => {
    const response = await api.get('/friends/friends');
    return response.data;
  },
  
  getPendingRequests: async () => {
    const response = await api.get('/friends/request/pending');
    return response.data;
  },
  
  acceptFriendRequest: async (requestId) => {
    const response = await api.patch(`/friends/${requestId}/accept`);
    return response.data;
  },
  
  rejectFriendRequest: async (requestId) => {
    const response = await api.patch(`/friends/${requestId}/reject`);
    return response.data;
  },
};

export const messagesAPI = {

  postMessage: async (text, pageOwnerId) => {
    const response = await api.post('/messages', { text, pageOwnerId });
    return response.data;
  },
  
  getMessagesForUser: async (userId) => {
    const response = await api.get(`/messages/page/${userId}`);
    return response.data;
  },
};

export const chatAPI = {

  getOrCreateRoom: async (userId) => {
    const response = await api.get(`/chat/room/${userId}`);
    return response.data;
  },
  
  getRoomMessages: async (roomId) => {
    const response = await api.get(`/chat/messages/${roomId}`);
    return response.data;
  },
  
  getUserRooms: async () => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },
};

export default api;
