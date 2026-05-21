import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Show session expired message if redirected
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      onLoginSuccess(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // UX Shortcut for review evaluation: Autocomplete credentials
  const fillDemoCredentials = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@aerotask.com');
      setPassword('admin123');
    } else {
      setEmail('rishmember@aerotask.com');
      setPassword('member123');
    }
    setError('');
  };

  return (
    <div className="login-page-container">
      <div className="login-card-glass glass-panel">
        <div className="login-brand">
          <svg className="login-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#loginGrad)" />
            <path d="M2 17L12 22L22 17" stroke="url(#loginGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="url(#loginGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="loginGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <h2>AeroTask</h2>
        </div>
        
        <p className="login-subtitle">Sign in to manage your team tasks</p>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="name@example.com" 
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-links">
          Don't have an account? <Link to="/register" className="glow-link">Create Account</Link>
        </div>

        {/* Evaluation Shortcut Box */}
        <div className="demo-credentials-box">
          <div className="demo-header">🚀 Quick-Login Demo Accounts</div>
          <p className="demo-desc">Select an account below to instantly autofill and test role functionalities:</p>
          <div className="demo-btn-row">
            <button className="demo-btn admin" onClick={() => fillDemoCredentials('ADMIN')}>
              🔑 Admin Demo
            </button>
            <button className="demo-btn member" onClick={() => fillDemoCredentials('MEMBER')}>
              👥 Member Demo
            </button>
          </div>
          <div className="demo-creds-hint">
            (Accounts will be auto-seeded or you can register new ones)
          </div>
        </div>
      </div>

      <style>{`
        .login-page-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: var(--bg-primary);
        }

        .login-card-glass {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .login-logo {
          width: 36px;
          height: 36px;
        }

        .login-brand h2 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-subtitle {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .login-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .login-footer-links {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 1.5rem;
        }

        .glow-link {
          color: var(--color-purple);
          text-decoration: none;
          font-weight: 600;
          transition: text-shadow 0.2s;
        }

        .glow-link:hover {
          text-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
          color: #a78bfa;
        }

        /* Demo Box styling */
        .demo-credentials-box {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.015);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .demo-header {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-cyan);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .demo-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .demo-btn-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .demo-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-heading);
        }

        .demo-btn.admin {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.2);
          color: #c084fc;
        }
        .demo-btn.admin:hover {
          background: var(--color-purple);
          color: white;
          box-shadow: var(--glow-purple);
        }

        .demo-btn.member {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.2);
          color: #67e8f9;
        }
        .demo-btn.member:hover {
          background: var(--color-cyan);
          color: white;
          box-shadow: var(--glow-cyan);
        }

        .demo-creds-hint {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Login;
