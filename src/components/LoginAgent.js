import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAgent, verifyOtp as verifyAgentOtp } from '../services/loginAgent';
import './index.css';

const LoginAgent = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const countryCode = '+91'; 

  // Send OTP to the mobile number
  const handleSendOtp = async () => {
    setIsLoading(true); // Set loading to true
    try {
      const agentData = { mobile: countryCode + mobile };
      const response = await loginAgent(agentData);

      if (response.message === 'OTP sent successfully') {
        setIsOtpSent(true);
        setMessage('OTP has been sent to your mobile.');
      } else {
        setMessage(response.error || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error during OTP request:', error);
      setMessage('An error occurred while trying to send OTP. Please try again.');
    } finally {
      setIsLoading(false); // Set loading back to false
    }
  };

  // Verify OTP and log the agent in
  const handleVerifyOtp = async () => {
    try {
      const agentData = { mobile: countryCode + mobile, otp };
      const response = await verifyAgentOtp(agentData);

      if (response.message === 'Login successful') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.agent));
        localStorage.setItem('role', 'agent');
        navigate('/agent-dashboard');
      } else {
        setMessage(response.error || 'Invalid OTP.');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      setMessage('An error occurred while trying to verify OTP. Please try again.');
    }
  };

  // Restrict mobile input to 10 digits
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  return (
    <div className="login login-container">
      <div className="login-box">
        <h2>Agent Login</h2>

        {/* Agent Login Form (Mobile + OTP) */}
        <div>
          <label>Mobile Number</label>
          <div className="mobile-code">
            <span className="country-code">{countryCode}</span> {/* Display fixed country code */}
            <input
              type="text"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter mobile number"
              className="mobile-number-input"
            />
          </div>
        </div>

        {/* Show OTP input after OTP is sent */}
        {isOtpSent ? (
          <>
            <div>
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            <button className="login-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </>
        ) : (
          <button 
            className="login-btn" 
            onClick={handleSendOtp} 
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Sending...' : 'Send OTP'} {/* Change button text */}
          </button>
        )}

        {/* Display error messages */}
        <div>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginAgent;
