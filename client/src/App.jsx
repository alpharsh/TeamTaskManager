import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';

function AppContent() {
  const [user, setUser] = useState(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Validate session on startup
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Proactively verify token validity with backend
          const response = await api.auth.getMe();
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired. Logging out.');
          handleLogout();
        }
      }
      setSessionChecking(false);
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (sessionChecking) {
    return (
      <div className="session-loader-overlay">
        <div className="loader-orbit">
          <div className="orbit-ring"></div>
          <div className="orbit-ball"></div>
        </div>
        <span className="loader-label">AeroTask Connecting...</span>
        <style>{`
          .session-loader-overlay {
            height: 100vh;
            width: 100vw;
            background: #080c14;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
          }
          .loader-orbit {
            position: relative;
            width: 60px;
            height: 60px;
          }
          .orbit-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(139, 92, 246, 0.15);
            border-radius: 50%;
          }
          .orbit-ball {
            position: absolute;
            width: 8px;
            height: 8px;
            background: var(--color-cyan);
            box-shadow: var(--glow-cyan);
            border-radius: 50%;
            animation: rotateOrbit 1.2s linear infinite;
            transform-origin: 30px 30px;
            left: 26px;
            top: 0;
          }
          .loader-label {
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
            font-family: var(--font-heading);
            letter-spacing: 0.05em;
          }
          @keyframes rotateOrbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {/* Sidebar - authenticated pages only */}
      {user && !isAuthPage && (
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          mobileOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main app routing */}
      <Routes>
        {/* Public auth screens */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* Private core screens */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/projects" 
          element={user ? <Projects user={user} onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/projects/:id" 
          element={user ? <ProjectDetails user={user} onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tasks" 
          element={user ? <Tasks user={user} onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> : <Navigate to="/login" replace />} 
        />

        {/* Redirect fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
