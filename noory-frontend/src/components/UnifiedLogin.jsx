import React, { useState } from 'react';
import './UnifiedLogin.css';

const UnifiedLogin = ({ onClose, onLogin }) => {
  const [loginType, setLoginType] = useState('user'); // 'user', 'admin', 'driver'
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    driver_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'ITSALOTOFWORKMAN';
  const API_URL = 'https://noory-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ADMIN LOGIN
      if (loginType === 'admin') {
        if (formData.username.toLowerCase() === 'admin' && formData.password === ADMIN_PASSWORD) {
          const adminUser = {
            username: 'admin',
            role: 'admin'
          };
          localStorage.setItem('nooriy_user', JSON.stringify(adminUser));
          onLogin(adminUser);
          window.location.href = '/';
          return;
        } else {
          setError('Invalid admin credentials');
          setLoading(false);
          return;
        }
      }

      // DRIVER LOGIN
      if (loginType === 'driver') {
        const response = await fetch(`${API_URL}/driver/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driver_number: formData.driver_number,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('nooriy_user', JSON.stringify(data.driver));
          onLogin(data.driver);
          window.location.href = '/';
        } else {
          setError(data.message || 'Driver login failed');
        }
        setLoading(false);
        return;
      }

      // USER LOGIN/REGISTRATION
      if (isLogin) {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('nooriy_user', JSON.stringify(data.user));
          onLogin(data.user);
          onClose();
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        // Registration
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: formData.address
          })
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please login.');
          setIsLogin(true);
          setFormData({
            username: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            driver_number: ''
          });
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="unified-login-overlay" onClick={onClose}>
      <div className="unified-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/* Login Type Selector */}
        <div className="login-type-selector">
          <button 
            className={loginType === 'user' ? 'active' : ''} 
            onClick={() => setLoginType('user')}
          >
            👤 User
          </button>
          <button 
            className={loginType === 'admin' ? 'active' : ''} 
            onClick={() => setLoginType('admin')}
          >
            🔐 Admin
          </button>
          <button 
            className={loginType === 'driver' ? 'active' : ''} 
            onClick={() => setLoginType('driver')}
          >
            🚗 Driver
          </button>
        </div>

        <h2>
          {loginType === 'admin' && 'Admin Login'}
          {loginType === 'driver' && 'Driver Login'}
          {loginType === 'user' && (isLogin ? 'User Login' : 'Create Account')}
        </h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* ADMIN/USER LOGIN FIELDS */}
          {(loginType === 'admin' || (loginType === 'user' && isLogin)) && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* DRIVER LOGIN FIELDS */}
          {loginType === 'driver' && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="driver_number"
                  placeholder="Driver Number (e.g., driver1)"
                  value={formData.driver_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* USER REGISTRATION FIELDS */}
          {loginType === 'user' && !isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <textarea
                  name="address"
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        {/* Toggle between login/register for users only */}
        {loginType === 'user' && (
          <p className="toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogin;