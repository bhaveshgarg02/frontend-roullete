import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/loginAdmin'; // Admin login API service
import { loginAgent } from '../services/loginAgent'; // Agent login API service


const LoginNew = () => {
  const [role, setRole] = useState('admin'); // Default to Admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false); // Track if OTP is sent for agents
  const [mobile, setMobile] = useState(''); // Mobile field for agents
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      const adminData = { email: username, password };
      const response = await loginAdmin(adminData);

      if (response.message === 'Login successful') {
        navigate('/admin-dashboard');
      } else {
        alert(response.error || 'Invalid admin login credentials!');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Failed to log in as admin. Please try again.');
    }
  };

  const handleSendOtp = async () => {
    try {
      const response = await loginAgent({ mobile }); // Send mobile to the `/login` endpoint for agents
      if (response.message === 'OTP sent successfully') {
        setOtpSent(true);
        alert('OTP sent to your mobile number!');
      } else {
        alert(response.error || 'Failed to send OTP!');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('An error occurred while sending the OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await loginAgent({ mobile, otp }); // Verify OTP at the `/verify-otp` endpoint for agents
      if (response.message === 'Login successful') {
        navigate('/agents-dashboard');
      } else {
        alert(response.error || 'Invalid OTP or expired!');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('Failed to verify OTP. Please try again.');
    }
  };

  const handleLogin = () => {
    if (role === 'admin') {
      handleAdminLogin();
    } else if (role === 'agent') {
      if (!otpSent) {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="login login-container">
      <div className="login-box">
        <h2>{role === 'admin' ? 'Admin Login' : 'Agent Login'}</h2>

        {role === 'admin' ? (
          <>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
          </>
        ) : (
          <>
            <div>
              <label>Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                disabled={otpSent}
              />
            </div>
            {otpSent && (
              <div>
                <label>OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
            )}
          </>
        )}

        <div>
          <label>Role</label>
          <select onChange={(e) => setRole(e.target.value)} value={role}>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          {role === 'agent' && !otpSent ? 'Send OTP' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginNew;
