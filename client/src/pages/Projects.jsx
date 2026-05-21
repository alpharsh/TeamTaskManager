import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Header from '../components/Header';
import Modal from '../components/Modal';

const Projects = ({ user, onLogout, toggleSidebar }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getAll();
      setProjects(response.projects);
    } catch (err) {
      setError('Error loading projects. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name) return;

    setError('');
    setCreateLoading(true);

    try {
      const response = await api.projects.create({ name, description });
      setProjects([response.project, ...projects]);
      setIsModalOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Header title="Projects" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />

      <div className="projects-action-row">
        <p className="page-desc-text">Manage, assign, and track projects you are assigned or belong to.</p>
        
        {/* RBAC: Only Admin can create projects */}
        {user?.role === 'ADMIN' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            ➕ Create Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="projects-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-panel skeleton" style={{ height: '220px' }}></div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel error-panel">
          <div>⚠️ {error}</div>
          <button className="btn btn-primary" onClick={fetchProjects}>Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel empty-projects-panel">
          <div className="empty-project-icon">📁</div>
          <h2>No Projects Found</h2>
          <p>
            {user?.role === 'ADMIN' 
              ? 'Get started by creating your first team workspace project.'
              : 'You have not been assigned to any projects yet. Contact your administrator.'}
          </p>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const isOwner = project.owner && project.owner._id === user?.id;
            
            return (
              <div key={project._id} className="glass-panel project-card glass-panel-hover">
                <div className="project-card-header">
                  <div className="project-icon-box">📁</div>
                  {isOwner && (
                    <span className="owner-badge">Owner</span>
                  )}
                </div>

                <div className="project-card-body">
                  <Link to={`/projects/${project._id}`} className="project-card-title-link">
                    <h3>{project.name}</h3>
                  </Link>
                  <p className="project-card-desc">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="project-card-footer">
                  <div className="project-members-avatars">
                    {project.members && project.members.slice(0, 4).map((m, idx) => (
                      <div 
                        key={idx} 
                        className="avatar-stacked"
                        title={`${m.user?.name || 'User'} (${m.role})`}
                        style={{ zIndex: 4 - idx }}
                      >
                        {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    ))}
                    {project.members && project.members.length > 4 && (
                      <div className="avatar-stacked more-badge">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <span className="project-members-count">
                    {project.members ? project.members.length : 0} members
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Glass Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label" htmlFor="projName">Project Name</label>
            <input 
              id="projName"
              type="text" 
              placeholder="e.g. Website Redesign" 
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="projDesc">Description</label>
            <textarea 
              id="projDesc"
              placeholder="Brief summary of the goals and deliverables..." 
              className="glass-input"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .projects-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .projects-action-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .projects-action-row button {
            width: 100%;
          }
        }

        .page-desc-text {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 480px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }

        .empty-projects-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem;
          text-align: center;
          gap: 1rem;
        }

        .empty-project-icon {
          font-size: 4rem;
        }

        .empty-projects-panel p {
          color: var(--text-secondary);
          max-width: 450px;
        }

        /* Project Card designs */
        .project-card {
          display: flex;
          flex-direction: column;
          height: 220px;
          justify-content: space-between;
        }

        .project-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .project-icon-box {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .owner-badge {
          background: rgba(139, 92, 246, 0.12);
          color: #c084fc;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .project-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .project-card-title-link {
          color: white;
          text-decoration: none;
        }
        .project-card-title-link h3:hover {
          color: var(--color-purple);
        }

        .project-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .project-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* stacked avatar styles */
        .project-members-avatars {
          display: flex;
          align-items: center;
        }

        .avatar-stacked {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          border: 2px solid var(--bg-secondary);
          margin-left: -8px;
        }
        .avatar-stacked:first-child {
          margin-left: 0;
        }

        .avatar-stacked.more-badge {
          background: var(--bg-glass-hover);
          color: var(--text-secondary);
          font-size: 0.6rem;
        }

        .project-members-count {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Projects;
