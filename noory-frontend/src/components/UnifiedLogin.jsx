import React, { useState } from 'react';
import './UnifiedLogin.css';

const UnifiedLogin = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'ITSALOTOFWORKMAN';
  const API_URL = 'https://noory-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔍 Login attempt - Username:', username, 'Password:', password);

    // ADMIN CHECK - FIRST PRIORITY
    if (password === ADMIN_PASSWORD) {
      console.log('✅ ADMIN PASSWORD MATCHED!');
      
      const adminUser = {
        id: 0,
        username: username || 'admin',
        email: 'admin@nooriy.com',
        role: 'admin'
      };

      console.log('✅ Creating admin user object:', adminUser);
      
      // Save to localStorage
      localStorage.setItem('nooriy_user', JSON.stringify(adminUser));
      console.log('✅ Saved to localStorage:', localStorage.getItem('nooriy_user'));
      
      // Call success callback
      onLoginSuccess(adminUser);
      
      // Close modal
      onClose();
      
      // Force page reload to trigger App.jsx check
      console.log('✅ Reloading page to show Admin Dashboard...');
      window.location.reload();
      
      setLoading(false);
      return;
    }

    // REGULAR USER LOGIN
    try {
      console.log('📡 Attempting regular user login...');
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('📡 Backend response:', data);

      if (response.ok && data.user) {
        console.log('✅ Regular login successful!', data.user);
        
        // Save to localStorage
        localStorage.setItem('nooriy_user', JSON.stringify(data.user));
        console.log('✅ Saved to localStorage:', localStorage.getItem('nooriy_user'));
        
        // Call success callback
        onLoginSuccess(data.user);
        
        // Close modal
        onClose();
        
        // Reload page
        window.location.reload();
      } else {
        setError(data.message || 'Invalid credentials');
        console.error('❌ Login failed:', data.message);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          phone,
          address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setEmail('');
        setPhone('');
        setAddress('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-login-overlay" onClick={onClose}>
      <div className="unified-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={isRegistering ? handleRegister : handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          {isRegistering && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </>
          )}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="admin-hint">
            💡 Admin password: {ADMIN_PASSWORD}
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <p className="toggle-form">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <span onClick={() => setIsRegistering(false)}>Login</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span onClick={() => setIsRegistering(true)}>Register</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default UnifiedLogin;