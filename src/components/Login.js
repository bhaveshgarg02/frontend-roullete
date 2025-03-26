import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Login = () => {
  const navigate = useNavigate();

  // Handle navigation to Admin or Agent Login
  const handleAdminLogin = () => {
    navigate('/login-admin');
  };

  const handleAgentLogin = () => {
    navigate('/login-agent');
  };

  return (
    <div className="login login-container">
      <div className="login-box">
        <h2>Login</h2>

        {/* Buttons for navigating to Admin or Agent Login */}
        <div>
          <button className="role-btn" onClick={handleAdminLogin}>
            Login as Admin
          </button>
          <button className="role-btn" onClick={handleAgentLogin}>
            Login as Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
