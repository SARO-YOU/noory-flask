import { useEffect, useState } from 'react';
import './LoadingScreen.css';

function LoadingScreen() {
  const [dots, setDots] = useState('');
  const [touchedIcons, setTouchedIcons] = useState(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleIconTouch = (iconId) => {
    setTouchedIcons(prev => new Set([...prev, iconId]));
    
    // Reset after animation completes
    setTimeout(() => {
      setTouchedIcons(prev => {
        const newSet = new Set(prev);
        newSet.delete(iconId);
        return newSet;
      });
    }, 1000);
  };

  const icons = [
    { id: 'cart', emoji: '🛒', class: 'cart' },
    { id: 'bike', emoji: '🏍️', class: 'bike' },
    { id: 'food1', emoji: '🍕', class: 'food1' },
    { id: 'food2', emoji: '🍔', class: 'food2' },
    { id: 'food3', emoji: '🥤', class: 'food3' },
    { id: 'food4', emoji: '🍎', class: 'food4' },
    { id: 'food5', emoji: '🥖', class: 'food5' },
    { id: 'bag', emoji: '🛍️', class: 'bag' },
  ];

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">🛒 NOOREY</h1>
        <p className="loading-text">Loading your shopping experience{dots}</p>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>

      {/* Floating animations with touch interaction */}
      <div className="floating-icons">
        {icons.map(icon => (
          <div
            key={icon.id}
            className={`float-item ${icon.class} ${touchedIcons.has(icon.id) ? 'touched' : ''}`}
            onClick={() => handleIconTouch(icon.id)}
            onTouchStart={() => handleIconTouch(icon.id)}
          >
            {icon.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingScreen;