import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/loginAdmin';
import './index.css';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Handle Admin Login with email and password
  const handleAdminLogin = async () => {
    setIsLoading(true); // Set loading to true
    try {
      const adminData = { email, password };
      const response = await loginAdmin(adminData); 

      if (response.message === 'Login successful') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.admin));
        localStorage.setItem('role', 'admin');
        navigate('/admin-dashboard');
      } else {
        setMessage(response.error || 'Invalid login credentials!');
      }
    } catch (error) {
      console.error('Error during Admin login:', error);
      setMessage('An error occurred while trying to log in. Please try again.');
    } finally {
      setIsLoading(false); // Set loading back to false
    }
  };

  return (
    <div className="login login-container">
      <div className="login-box">
        <h2>Admin Login</h2>

        {/* Admin Login Form */}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <button className="login-btn" onClick={handleAdminLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login as Admin'}
        </button>

        {/* Display error messages */}
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginAdmin;
