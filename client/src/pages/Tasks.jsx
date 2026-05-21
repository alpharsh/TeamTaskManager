import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Tasks = ({ user, onLogout, toggleSidebar }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(true); // Default to checked for standard user experience

  // Detail Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchTasksAndFilters = async () => {
    try {
      setLoading(true);
      
      // Load user projects to populate project filter dropdown
      const projectsRes = await api.projects.getAll();
      setProjects(projectsRes.projects);

      // Load tasks with filters
      await applyFilters();
    } catch (err) {
      setError('Error retrieving tasks. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filters = {
        project: projectFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assignedToMe: assignedToMeFilter || undefined
      };
      
      const response = await api.tasks.getAll(filters);
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to filter tasks', err);
    }
  };

  useEffect(() => {
    fetchTasksAndFilters();
  }, []);

  // Re-fetch whenever filters change
  useEffect(() => {
    applyFilters();
  }, [projectFilter, statusFilter, priorityFilter, assignedToMeFilter]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatusOnly = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const response = await api.tasks.update(selectedTask._id, { status: editStatus });
      setTasks(tasks.map(t => t._id === selectedTask._id ? response.task : t));
      setIsDetailModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Header title="My Tasks" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />

      {/* Dynamic Filter Panel */}
      <div className="filter-panel-glass glass-panel">
        <h4 className="filter-title-text">📊 Filters & Search</h4>
        
        <div className="filter-controls-row">
          <div className="filter-control-item">
            <label className="form-label" htmlFor="fProj">Filter by Project</label>
            <select 
              id="fProj"
              className="glass-input"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-control-item">
            <label className="form-label" htmlFor="fStat">Status</label>
            <select 
              id="fStat"
              className="glass-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Under Review</option>
              <option value="DONE">Completed</option>
            </select>
          </div>

          <div className="filter-control-item">
            <label className="form-label" htmlFor="fPrio">Priority</label>
            <select 
              id="fPrio"
              className="glass-input"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="filter-control-item checkbox-item">
            <label className="checkbox-label-wrapper">
              <input 
                type="checkbox" 
                className="glass-checkbox"
                checked={assignedToMeFilter}
                onChange={(e) => setAssignedToMeFilter(e.target.checked)}
              />
              <span className="checkbox-custom-label">Assigned To Me</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tasks listing view */}
      {loading ? (
        <div className="tasks-list-loader">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-panel skeleton" style={{ height: '70px', marginBottom: '0.75rem' }}></div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel error-panel">
          <div>⚠️ {error}</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel empty-tasks-panel">
          <div className="empty-tasks-icon">📋</div>
          <h3>No Tasks Found</h3>
          <p>Modify your filters or check other projects for task listings.</p>
        </div>
      ) : (
        <div className="tasks-cards-list-wrapper">
          {tasks.map(task => {
            const isDone = task.status === 'DONE';
            
            return (
              <div 
                key={task._id} 
                className={`glass-panel task-list-row-card ${isDone ? 'done-card' : ''}`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="card-left-section">
                  <span className={`status-indicator ${task.status.toLowerCase() === 'in_progress' ? 'progress' : task.status.toLowerCase()}`}></span>
                  <div className="task-row-details">
                    <h4 className="task-row-title" style={isDone ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>{task.title}</h4>
                    <span className="task-row-project-tag">📁 {task.project ? task.project.name : 'Unknown Project'}</span>
                  </div>
                </div>

                <div className="card-right-section">
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  
                  <span className={`badge badge-${task.status.toLowerCase() === 'in_progress' ? 'progress' : task.status.toLowerCase()}`}>
                    {task.status.replace('_', ' ')}
                  </span>

                  <span className="task-row-due">
                    {task.dueDate ? `📅 Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No deadline'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Status Toggler for quick update from listing screen */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Quick Actions">
        {selectedTask && (
          <form onSubmit={handleUpdateStatusOnly} className="quick-actions-form">
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{selectedTask.title}</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Project: <strong>{selectedTask.project ? selectedTask.project.name : 'Unknown'}</strong>
            </p>

            {/* Check if assigned to them or if they are admin, so they can switch status */}
            {(selectedTask.assignee && selectedTask.assignee._id === user.id) || user.role === 'ADMIN' ? (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="qStat">Change Task Status</label>
                <select 
                  id="qStat"
                  className="glass-input"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Under Review</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>
            ) : (
              <div className="status-warning-card">
                ⚠️ You can only update the status of tasks assigned to yourself.
              </div>
            )}

            <div className="modal-footer-btns">
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Cancel
              </button>
              
              {((selectedTask.assignee && selectedTask.assignee._id === user.id) || user.role === 'ADMIN') && (
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Updating...' : 'Update Status'}
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>

      <style>{`
        .filter-panel-glass {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .filter-title-text {
          font-family: var(--font-heading);
          color: white;
          font-size: 1rem;
          font-weight: 700;
        }

        .filter-controls-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          align-items: flex-end;
        }

        @media (max-width: 576px) {
          .filter-controls-row {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .checkbox-item {
            justify-content: flex-start !important;
            padding-top: 0.5rem !important;
          }
        }

        .filter-control-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-item {
          justify-content: center;
          height: 100%;
          padding-bottom: 0.5rem;
        }

        .checkbox-label-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .glass-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--color-purple);
          cursor: pointer;
        }

        .checkbox-custom-label {
          font-weight: 500;
          color: white;
        }

        /* Task card list items */
        .tasks-cards-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .task-list-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-list-row-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: scale(1.005);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .done-card {
          border-color: rgba(16, 185, 129, 0.05);
          background: rgba(16, 185, 129, 0.02);
        }

        .card-left-section {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .task-row-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .task-row-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .task-row-project-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .card-right-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .task-row-due {
          font-size: 0.8rem;
          color: var(--text-secondary);
          min-width: 120px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .task-list-row-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .card-right-section {
            width: 100%;
            justify-content: space-between;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
          }
          .task-row-due {
            text-align: left;
            min-width: auto;
          }
        }

        .empty-tasks-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem;
          text-align: center;
          gap: 0.75rem;
        }

        .empty-tasks-icon {
          font-size: 4rem;
        }

        .empty-tasks-panel p {
          color: var(--text-secondary);
        }

        .status-warning-card {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #fbcfe8;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default Tasks;
