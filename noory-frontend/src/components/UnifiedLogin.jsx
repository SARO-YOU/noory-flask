import React, { useState } from 'react';

const ADMIN_PASSWORD = 'ITSALOTOFWORKMAN';

const UnifiedLogin = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const username = formData.username.toLowerCase().trim();
    const password = formData.password;

    // 1. CHECK IF ADMIN
    if (username === 'admin') {
      if (password === ADMIN_PASSWORD) {
        const adminUser = {
          id: 0,
          username: 'admin',
          email: 'admin@nooriy.com',
          role: 'admin'
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        onLoginSuccess(adminUser);
        window.location.href = '/';
      } else {
        setError('Invalid admin password');
        setLoading(false);
      }
      return;
    }

    // 2. CHECK IF DRIVER (username starts with "driver")
    if (username.startsWith('driver')) {
      try {
        const response = await fetch('https://noory-backend.onrender.com/api/driver/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driver_number: username,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('user', JSON.stringify(data.driver));
          onLoginSuccess(data.driver);
          window.location.href = '/';
        } else {
          setError(data.message || 'Invalid driver credentials');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Driver login error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. ELSE - REGULAR CUSTOMER LOGIN
    try {
      const response = await fetch('https://noory-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Don't allow registration with "admin" or "driver" usernames
    const username = formData.username.toLowerCase().trim();
    if (username === 'admin' || username.startsWith('driver')) {
      setError('This username is reserved. Please choose a different username.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://noory-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful registration
        const loginResponse = await fetch('https://noory-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('user', JSON.stringify(loginData.user));
          onLoginSuccess(loginData.user);
          onClose();
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? '👤 Login' : '📝 Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {isLogin ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">Username *</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cannot start with "admin" or "driver"
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>⏳ {isLogin ? 'Logging in...' : 'Creating Account...'}</span>
            ) : (
              <span>{isLogin ? 'Login' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {isLogin ? (
            <p className="text-gray-600">
              📝 Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFormData({
                    username: '',
                    password: '',
                    email: '',
                    phone: '',
                    confirmPassword: ''
                  });
                }}
                className="text-purple-600 hover:underline font-semibold"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFormData({
                    username: '',
                    password: '',
                    email: '',
                    phone: '',
                    confirmPassword: ''
                  });
                }}
                className="text-purple-600 hover:underline font-semibold"
              >
                Login here
              </button>
            </p>
          )}
        </div>

        {isLogin && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-center text-gray-600">
            🔒 Your credentials are securely encrypted
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogin;