import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Lösenord matchar inte');
      return;
    }

    if (formData.password.length < 6) {
      setError('Lösenord måste vara minst 6 tecken långt');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      setError('Användarnamn måste vara mellan 3 och 15 tecken långt');
      return;
    }

    setLoading(true);
    const result = await register(formData.username, formData.password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center mb-4">Registrera dig</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
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
        
        <div className="mb-3">
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
        
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label"> Bekräfta lösenord: </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <button type="submit" className="btn btn-primary w-100" > Registrera dig </button>
      </form>
      
      <p className="text-center mt-3">
        Har du redan ett konto?{' '}
        <button type="button" onClick={onSwitchToLogin} className="btn btn-link"> Logga in här </button>
      </p>
    </div>
  );
};

export default RegisterForm;
