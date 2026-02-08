import { useState } from 'react';
import './ProfileMenu.css';

function ProfileMenu({ user, onLoginClick, onLogout, onFeedbackClick, onDriverApplicationClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    onLoginClick();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const handleFeedback = () => {
    setMenuOpen(false);
    onFeedbackClick();
  };

  const handleDriverApplication = () => {
    setMenuOpen(false);
    onDriverApplicationClick();
  };

  return (
    <div className="profile-menu-container">
      <button className="profile-btn" onClick={toggleMenu}>
        {user ? (
          <>
            <span className="profile-icon">👤</span>
            <span className="profile-name">{user.displayName}</span>
          </>
        ) : (
          <>
            <span className="profile-icon">👤</span>
            <span className="profile-name">Profile</span>
          </>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="profile-dropdown">
            {user ? (
              <>
                <div className="profile-header">
                  <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="profile-info">
                    <p className="profile-display-name">{user.displayName}</p>
                    <p className="profile-type">{user.type}</p>
                  </div>
                </div>
                
                <div className="menu-divider" />
                
                {user.type === 'customer' && (
                  <>
                    <button className="menu-item" onClick={handleFeedback}>
                      💬 Send Feedback
                    </button>
                    <button className="menu-item" onClick={handleDriverApplication}>
                      🚗 Apply as Driver
                    </button>
                    <div className="menu-divider" />
                  </>
                )}
                
                <button className="menu-item logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button className="menu-item" onClick={handleLoginClick}>
                  🔐 Login
                </button>
                <div className="menu-divider" />
                <button className="menu-item" onClick={handleFeedback}>
                  💬 Send Feedback
                </button>
                <button className="menu-item" onClick={handleDriverApplication}>
                  🚗 Apply as Driver
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileMenu;