import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ user, onLogout, mobileOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onClose?.();
    onLogout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={onClose}></div>
      )}
      <aside className={`sidebar-glass ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg className="sidebar-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#logoGrad)" />
            <path d="M2 17L12 22L22 17" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">AeroTask</span>
          {mobileOpen && (
            <button className="sidebar-close-btn" onClick={onClose}>×</button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/projects" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">📁</span>
            <span>Projects</span>
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">📋</span>
            <span>My Tasks</span>
          </NavLink>
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-profile-summary">
              <div className="avatar-large">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-text-info">
                <div className="user-profile-name">{user.name}</div>
                <div className="user-profile-role-badge">{user.role}</div>
              </div>
            </div>
            <button onClick={handleLogoutClick} className="btn-logout">
              <span>🚪</span> Logout
            </button>
          </div>
        )}

        <style>{`
          .sidebar-glass {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--sidebar-width);
            background: rgba(10, 16, 30, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-right: 1px solid var(--glass-border);
            display: flex;
            flex-direction: column;
            padding: 2rem 1.5rem;
            z-index: 1100;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 3rem;
            position: relative;
          }

          .sidebar-close-btn {
            position: absolute;
            right: 0;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.75rem;
            cursor: pointer;
            line-height: 1;
            padding: 0.25rem;
            display: none;
          }

          @media (max-width: 992px) {
            .sidebar-close-btn {
              display: block;
            }
          }

          .sidebar-logo {
            width: 32px;
            height: 32px;
          }

          .brand-text {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.03em;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.85rem 1.25rem;
            border-radius: 12px;
            color: var(--text-secondary);
            text-decoration: none;
            font-family: var(--font-heading);
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
          }

          .nav-item:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.05);
          }

          .nav-item.active {
            color: #ffffff;
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.2);
            box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
          }

          .nav-item.active .nav-icon {
            filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.6));
          }

          .nav-icon {
            font-size: 1.2rem;
            transition: transform 0.2s;
          }

          .nav-item:hover .nav-icon {
            transform: scale(1.1);
          }

          .sidebar-footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .user-profile-summary {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .avatar-large {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: var(--glow-purple);
          }

          .user-text-info {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }

          .user-profile-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .user-profile-role-badge {
            align-self: flex-start;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.1rem 0.4rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--color-cyan);
            border-radius: 4px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .btn-logout {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.15);
            color: #f87171;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.6rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .btn-logout:hover {
            background: #ef4444;
            color: white;
            box-shadow: var(--glow-rose);
          }

          .sidebar-mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 1050;
            animation: fadeIn 0.2s ease-out;
          }

          @media (max-width: 992px) {
            .sidebar-glass {
              transform: translateX(-100%);
            }
            .sidebar-glass.open {
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
