import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Header from '../components/Header';

const Dashboard = ({ user, onLogout, toggleSidebar }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data.stats);
    } catch (err) {
      setError('Could not retrieve dashboard statistics. Ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <Header title="Dashboard" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        
        {/* Glowing Loading Skeletons */}
        <div className="stats-grid">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel skeleton" style={{ height: '110px' }}></div>
          ))}
        </div>
        
        <div className="dashboard-grid">
          <div className="glass-panel skeleton" style={{ height: '350px' }}></div>
          <div className="glass-panel skeleton" style={{ height: '350px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="main-content">
        <Header title="Dashboard" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <div className="glass-panel error-panel">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error || 'Server error. Click retry.'}</div>
          <button className="btn btn-primary" onClick={fetchStats}>Retry Connection</button>
        </div>
        <style>{`
          .error-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
            gap: 1.25rem;
          }
          .error-icon {
            font-size: 3rem;
          }
          .error-text {
            color: var(--text-secondary);
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  // Calculate my completion rate
  const myCompletionRate = stats.myTasks.total > 0 
    ? Math.round((stats.myTasks.completed / stats.myTasks.total) * 100)
    : 0;

  return (
    <div className="main-content">
      <Header title="Dashboard" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card border-glow-purple">
          <div>
            <div className="form-label">Total Tasks</div>
            <div className="stat-value text-glow-purple">{stats.totalTasks}</div>
          </div>
          <div className="stat-icon-wrapper purple">📋</div>
        </div>

        <div className="glass-panel stat-card border-glow-cyan">
          <div>
            <div className="form-label">In Progress</div>
            <div className="stat-value text-glow-cyan">{stats.inProgressTasks}</div>
          </div>
          <div className="stat-icon-wrapper cyan">⚡</div>
        </div>

        <div className="glass-panel stat-card border-glow-emerald">
          <div>
            <div className="form-label">Completed</div>
            <div className="stat-value text-glow-emerald">{stats.doneTasks}</div>
          </div>
          <div className="stat-icon-wrapper emerald">✔️</div>
        </div>

        <div className="glass-panel stat-card border-glow-rose">
          <div>
            <div className="form-label">Overdue Tasks</div>
            <div className="stat-value text-glow-rose">{stats.overdueTasks}</div>
          </div>
          <div className="stat-icon-wrapper rose">⏳</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Projects Summary */}
        <div className="glass-panel project-summary-panel">
          <div className="panel-header">
            <h3>Projects Overview</h3>
            <Link to="/projects" className="btn btn-secondary btn-sm-text">View All</Link>
          </div>
          
          <div className="project-list-summary">
            {stats.projectSummary.length === 0 ? (
              <div className="empty-projects-state">
                <p>You don't belong to any projects yet.</p>
                <Link to="/projects" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Create First Project</Link>
              </div>
            ) : (
              stats.projectSummary.map(project => (
                <div key={project.id} className="project-summary-row">
                  <div className="project-row-left">
                    <span className="project-folder-icon">📁</span>
                    <div className="project-info-col">
                      <Link to={`/projects/${project.id}`} className="project-summary-name">
                        {project.name}
                      </Link>
                      <div className="project-summary-tasks">
                        {project.completedTasks}/{project.totalTasks} Tasks Completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-row-right">
                    <div className="progress-wrapper">
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${project.completionRate}%` }}></div>
                      </div>
                      <span className="progress-percent-label">{project.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Personal Progress Tracker */}
        <div className="glass-panel progress-analytics-panel">
          <h3>Your Task Progress</h3>
          <div className="progress-circle-container">
            {/* Visual HTML/CSS circular progress ring */}
            <div className="circular-progress" style={{ 
              background: `conic-gradient(var(--color-purple) ${myCompletionRate * 3.6}deg, rgba(255,255,255,0.05) 0deg)`
            }}>
              <div className="circular-progress-inner">
                <span className="circle-percent">{myCompletionRate}%</span>
                <span className="circle-label">Done</span>
              </div>
            </div>
            
            <div className="progress-details-col">
              <div className="p-detail">
                <span className="dot dot-total"></span>
                <span>Assigned Tasks: <strong>{stats.myTasks.total}</strong></span>
              </div>
              <div className="p-detail">
                <span className="dot dot-completed"></span>
                <span>Completed: <strong>{stats.myTasks.completed}</strong></span>
              </div>
              <div className="p-detail">
                <span className="dot dot-pending"></span>
                <span>Pending Tasks: <strong>{stats.myTasks.pending}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Tasks */}
      <div className="glass-panel recent-tasks-panel">
        <h3>Recent Task Additions</h3>
        <div className="recent-tasks-list">
          {stats.recentTasks.length === 0 ? (
            <div className="empty-tasks-state">
              No tasks created recently.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTasks.map(task => (
                    <tr key={task._id}>
                      <td className="task-title-cell">
                        <Link to={`/projects/${task.project._id}`} className="task-title-link">
                          {task.title}
                        </Link>
                      </td>
                      <td>{task.project.name}</td>
                      <td>
                        {task.assignee ? (
                          <div className="assignee-cell">
                            <div className="avatar-mini">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status.toLowerCase() === 'in_progress' ? 'progress' : task.status.toLowerCase()}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .border-glow-purple { border-color: rgba(139, 92, 246, 0.15); }
        .border-glow-purple:hover { border-color: rgba(139, 92, 246, 0.4); box-shadow: var(--glow-purple); }
        
        .border-glow-cyan { border-color: rgba(6, 182, 212, 0.15); }
        .border-glow-cyan:hover { border-color: rgba(6, 182, 212, 0.4); box-shadow: var(--glow-cyan); }
        
        .border-glow-emerald { border-color: rgba(16, 185, 129, 0.15); }
        .border-glow-emerald:hover { border-color: rgba(16, 185, 129, 0.4); box-shadow: var(--glow-emerald); }
        
        .border-glow-rose { border-color: rgba(239, 68, 68, 0.15); }
        .border-glow-rose:hover { border-color: rgba(239, 68, 68, 0.4); box-shadow: var(--glow-rose); }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .stat-icon-wrapper.purple { background: rgba(139, 92, 246, 0.1); color: var(--color-purple); }
        .stat-icon-wrapper.cyan { background: rgba(6, 182, 212, 0.1); color: var(--color-cyan); }
        .stat-icon-wrapper.emerald { background: rgba(16, 185, 129, 0.1); color: var(--color-emerald); }
        .stat-icon-wrapper.rose { background: rgba(239, 68, 68, 0.1); color: var(--color-rose); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .btn-sm-text {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
        }

        .project-list-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-projects-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .project-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .project-summary-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateX(3px);
        }

        .project-row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .project-folder-icon {
          font-size: 1.5rem;
        }

        .project-info-col {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .project-summary-name {
          font-weight: 600;
          color: white;
          text-decoration: none;
          font-family: var(--font-heading);
          font-size: 0.95rem;
        }
        .project-summary-name:hover {
          color: var(--color-purple);
        }

        .project-summary-tasks {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .project-row-right {
          width: 40%;
          min-width: 150px;
        }

        .progress-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-percent-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-cyan);
          min-width: 32px;
          text-align: right;
        }

        /* Circular progress container */
        .progress-circle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .circular-progress {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          transition: background 0.5s ease;
        }

        .circular-progress-inner {
          width: 116px;
          height: 116px;
          background: var(--bg-secondary);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .circle-percent {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: white;
          text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
        }

        .circle-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-details-col {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
          padding: 0 1rem;
        }

        .p-detail {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .p-detail strong {
          color: white;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-total { background: var(--text-muted); }
        .dot-completed { background: var(--color-purple); }
        .dot-pending { background: var(--color-cyan); }

        /* Tables section */
        .glass-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .glass-table th {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.01);
          white-space: nowrap;
        }

        .glass-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.9rem;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .glass-table tr:hover {
          background: rgba(255, 255, 255, 0.01);
        }

        .task-title-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }
        .task-title-link:hover {
          color: var(--color-purple);
        }

        .assignee-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .avatar-mini {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-cyan);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .empty-tasks-state {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
