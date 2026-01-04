import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);

  };

  return (
    <div>
      <h2 className="text-center mb-2">Logga in</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="form-label"> Användarnamn: </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
            maxLength="30"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label"> Lösenord: </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100"> Logga in </button>
      </form>
      <p className="text-center mt-3">
        Inget konto?{' '}
        <button type="button" onClick={onSwitchToRegister} className="btn btn-link">
          Registrera dig här
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
