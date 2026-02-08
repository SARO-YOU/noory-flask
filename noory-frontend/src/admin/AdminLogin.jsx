import { useState } from 'react';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'ITSALOTOFWORKMAN';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid admin password!');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>🔐 Admin Login</h1>
        <p>Enter admin password to access dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-password-input"
          />
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="admin-login-btn">
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;