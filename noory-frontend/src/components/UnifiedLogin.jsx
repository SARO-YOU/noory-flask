import { useState } from 'react';
import './UnifiedLogin.css';

function UnifiedLogin({ onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'ITSALOTOFWORKMAN';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    // Check if admin password
    if (password === ADMIN_PASSWORD) {
      onLoginSuccess({
        type: 'admin',
        username: username,
        displayName: `${username} - ADMIN`
      });
      return;
    }

    // Check if driver password (format: DRIVER1-secretpass)
    const driverPattern = /^DRIVER(\d+)-(.+)$/;
    const driverMatch = password.match(driverPattern);
    
    if (driverMatch) {
      const driverNumber = driverMatch[1];
      const secretPassword = driverMatch[2];
      
      if (secretPassword.length > 0) {
        onLoginSuccess({
          type: 'driver',
          username: username,
          driverNumber: driverNumber,
          displayName: `${username} - Driver #${driverNumber}`
        });
        return;
      }
    }

    // Regular customer login
    onLoginSuccess({
      type: 'customer',
      username: username,
      displayName: username
    });
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>👤 Login</h2>
        <p className="login-subtitle">Enter your credentials to continue</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-submit-btn">
            Login
          </button>
        </form>

        <div className="login-help">
          <p>📝 Don't have an account? Just enter a username and password to create one!</p>
          <p>🚗 Drivers: Use password format DRIVER#-yourpassword</p>
        </div>
      </div>
    </div>
  );
}

export default UnifiedLogin;