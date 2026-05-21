import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, user, onLogout, toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dynamic welcome message
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClose = (e) => {
      if (!e.target.closest('.header-right')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [dropdownOpen]);

  return (
    <header className="header-glass">
      <div className="header-left">
        <button 
          className="mobile-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          ☰
        </button>
        <div className="header-meta">
          <div className="greeting-text">{getGreeting()}, {user?.name || 'User'} 👋</div>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>

      <div className="header-right">
        {user && (
          <>
            <div 
              className="user-indicator"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              <span className="user-email-tag">{user.email}</span>
              <div className="avatar-small">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-profile-header">
                  <div className="avatar-large-dropdown">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">{user.name}</div>
                    <span className={`chip-role ${user.role?.toLowerCase() || 'member'}`} style={{ alignSelf: 'flex-start', marginTop: '0.15rem' }}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-user-email-row">
                  <span className="email-icon">✉️</span>
                  <span className="dropdown-user-email">{user.email}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="btn-logout" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .header-glass {
          background: rgba(10, 16, 30, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-glass);
          width: 100%;
          position: relative;
          z-index: 1000;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .greeting-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
        }

        .user-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 0.35rem 0.75rem;
          border-radius: 30px;
          flex-shrink: 0;
          user-select: none;
          transition: background-color 0.2s;
        }
        .user-indicator:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .user-email-tag {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-small {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        /* Float Dropdown styling */
        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.75rem);
          right: 0;
          background: rgba(15, 22, 38, 0.99);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 1.25rem;
          min-width: 240px;
          box-shadow: var(--shadow-glass);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 1200;
          animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dropdown-profile-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-large-dropdown {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: var(--glow-purple);
          flex-shrink: 0;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .dropdown-user-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 0.95rem;
          font-family: var(--font-heading);
        }

        .dropdown-user-email-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .dropdown-user-email {
          word-break: break-all;
        }

        .email-icon {
          font-size: 0.9rem;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          width: 100%;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 992px) {
          .mobile-toggle {
            display: block;
          }
          .user-email-tag {
            display: none;
          }
          .user-indicator {
            background: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .avatar-small {
            width: 32px;
            height: 32px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
