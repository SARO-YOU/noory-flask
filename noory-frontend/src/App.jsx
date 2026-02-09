import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Shop from './components/Shop';
import AdminDashboard from './admin/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 App initializing...');
      
      // Show loading screen for minimum 2 seconds
      const startTime = Date.now();
      
      // Check localStorage for saved user
      const savedUser = localStorage.getItem('nooriy_user');
      console.log('📦 localStorage check:', savedUser);
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('✅ Found saved user:', userData);
          console.log('✅ User role:', userData.role);
          console.log('✅ Is admin?', userData.role === 'admin');
          setUser(userData);
        } catch (err) {
          console.error('❌ Error parsing saved user:', err);
          localStorage.removeItem('nooriy_user');
        }
      } else {
        console.log('ℹ️ No saved user found');
      }
      
      // Ensure minimum loading time
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      
      setLoading(false);
      console.log('✅ App initialized!');
    };

    initializeApp();
  }, []);

  // Show loading screen FIRST
  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  console.log('🔍 Current user:', user);
  console.log('🔍 Is admin?', isAdmin);

  // If admin, show AdminDashboard
  if (isAdmin) {
    console.log('✅ Rendering Admin Dashboard!');
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<AdminDashboard user={user} setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  // Otherwise show Shop
  console.log('✅ Rendering Shop!');
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Shop user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;