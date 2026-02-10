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

    try {
      // Check if admin
      if (username === 'admin') {
        if (password === ADMIN_PASSWORD) {
          localStorage.setItem('user', JSON.stringify({
            username: 'admin',
            role: 'admin'
          }));
          onLoginSuccess({ username: 'admin', role: 'admin' });
          window.location.href = '/admin';
          return;
        } else {
          setError('Invalid admin password');
          setLoading(false);
          return;
        }
      }

      // Check if driver
      if (username.startsWith('driver')) {
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
          window.location.href = '/driver-dashboard';
          return;
        } else {
          setError(data.message || 'Invalid driver credentials');
          setLoading(false);
          return;
        }
      }

      // Regular user login
      const response = await fetch('https://noory-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
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
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://noory-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful registration
        const loginResponse = await fetch('https://noory-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
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
      console.error('Registration error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? '👤 Login' : '📝 Create Account'}
          </h2>
          <p className="text-white text-sm mt-1">
            {isLogin 
              ? 'Enter your credentials to continue' 
              : 'Join NOORIY today!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="p-6">
          {/* Username */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">
              Username {!isLogin && '*'}
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {/* Email - Registration Only */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold">
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
          )}

          {/* Phone - Registration Only */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="0712345678 or 0110123456"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">
              Password {!isLogin && '*'}
            </label>
            <input
              type="password"
              name="password"
              placeholder={isLogin ? "Enter password" : "Create a strong password"}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {/* Confirm Password - Registration Only */}
          {!isLogin && (
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
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>⏳ {isLogin ? 'Logging in...' : 'Creating Account...'}</span>
            ) : (
              <span>{isLogin ? 'Login' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="px-6 pb-6 text-center">
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
                className="text-purple-600 font-semibold hover:underline"
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
                className="text-purple-600 font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          )}

          {isLogin && (
            <p className="text-gray-500 text-sm mt-3">
              🚗 Drivers: Get credentials from admin
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;