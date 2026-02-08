import { useState } from 'react';
import './DriverLogin.css';

function DriverLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation - we'll add database check later
    if (username && password) {
      onLogin({
        username: username,
        id: 'driver_' + Date.now()
      });
      setError('');
    } else {
      setError('Please enter both username and password');
    }
  };

  return (
    <div className="driver-login-container">
      <div className="driver-login-box">
        <h1>🚗 Driver Login</h1>
        <p>Enter your credentials to access driver dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="driver-input"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="driver-input"
          />
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="driver-login-btn">
            Login as Driver
          </button>
        </form>
      </div>
    </div>
  );
}

export default DriverLogin;