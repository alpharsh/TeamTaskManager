import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import Header from '../components/Header';
import Modal from '../components/Modal';

const ProjectDetails = ({ user, onLogout, toggleSidebar }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectRole, setProjectRole] = useState('MEMBER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // All registered users (for assignee selectors & member invites)
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form Fields - New Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  // Form Fields - Invite Member
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [memberLoading, setMemberLoading] = useState(false);
  
  // Detailed Task Edit state (for admin edits)
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const data = await api.projects.getById(id);
      setProject(data.project);
      setTasks(data.tasks);
      setProjectRole(data.role); // Server calculated role ('ADMIN' or 'MEMBER')
      
      // Fetch system users for drop-downs
      const usersData = await api.auth.getUsers();
      setAllRegisteredUsers(usersData.users);
    } catch (err) {
      setError(err.message || 'Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    setTaskLoading(true);
    try {
      const response = await api.tasks.create(id, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        assignee: taskAssignee || undefined
      });
      setTasks([response.task, ...tasks]);
      setIsTaskModalOpen(false);
      resetTaskForm();
    } catch (err) {
      alert(err.message || 'Error creating task');
    } finally {
      setTaskLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setTaskAssignee('');
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;

    setMemberLoading(true);
    try {
      const response = await api.projects.addMember(id, {
        email: memberEmail,
        role: memberRole
      });
      setProject(response.project);
      setIsMemberModalOpen(false);
      setMemberEmail('');
      setMemberRole('MEMBER');
    } catch (err) {
      alert(err.message || 'Error inviting member');
    } finally {
      setMemberLoading(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await api.projects.removeMember(id, userId);
      setProject(response.project);
      // Refresh tasks because some assignees might have been set to null
      const updatedTasks = tasks.map(t => 
        t.assignee && t.assignee._id === userId ? { ...t, assignee: null } : t
      );
      setTasks(updatedTasks);
    } catch (err) {
      alert(err.message || 'Error removing member');
    }
  };

  // Task Details click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditMode(false);
    
    // Fill edit fields in case they start editing
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(task.assignee ? task.assignee._id : '');
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    
    setIsDetailModalOpen(true);
  };

  // Update Task (Full Admin update or Member status-only update)
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const updatePayload = {
      status: editStatus
    };

    // If project Admin, they can update everything
    if (projectRole === 'ADMIN') {
      updatePayload.title = editTitle;
      updatePayload.description = editDesc;
      updatePayload.priority = editPriority;
      updatePayload.dueDate = editDueDate || null;
      updatePayload.assignee = editAssignee || null;
    }

    try {
      const response = await api.tasks.update(selectedTask._id, updatePayload);
      
      // Update local task array
      setTasks(tasks.map(t => t._id === selectedTask._id ? response.task : t));
      setIsDetailModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      alert(err.message || 'Error updating task');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.tasks.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      setIsDetailModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // NATIVE HTML5 DRAG & DROP
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const draggedTask = tasks.find(t => t._id === taskId);
    
    if (!draggedTask) return;
    if (draggedTask.status === targetStatus) return;

    // RBAC: If member, check if task is assigned to them
    if (projectRole === 'MEMBER' && (!draggedTask.assignee || draggedTask.assignee._id !== user.id)) {
      return alert('You can only update the status of tasks assigned directly to you.');
    }

    // Optimistically update status locally for immediate feedback
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const response = await api.tasks.update(taskId, { status: targetStatus });
      // Replace with fully resolved task from server
      setTasks(originalTasks.map(t => t._id === taskId ? response.task : t));
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      alert(err.message || 'Could not update task status');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <Header title="Kanban Board" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <div className="skeleton" style={{ height: '80px', borderRadius: '16px' }}></div>
        <div className="kanban-board">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="main-content">
        <Header title="Kanban Board" user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <div className="glass-panel error-panel">
          <div>⚠️ {error || 'Project not found'}</div>
          <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
        </div>
      </div>
    );
  }

  // Filter tasks into columns
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="main-content">
      <Header title={`${project.name}`} user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />

      {/* Board Information & Member Invite Panel */}
      <div className="board-top-section glass-panel">
        <div className="board-info-header">
          <div className="board-meta-details">
            <Link to="/projects" className="back-link">← Projects</Link>
            <h2 className="project-detail-title">{project.name}</h2>
            <p className="project-detail-desc">{project.description || 'No description provided.'}</p>
          </div>

          <div className="board-actions-group">
            {projectRole === 'ADMIN' && (
              <>
                <button onClick={() => setIsMemberModalOpen(true)} className="btn btn-secondary">
                  👥 Manage Team ({project.members.length})
                </button>
                <button onClick={() => setIsTaskModalOpen(true)} className="btn btn-primary">
                  ➕ Create Task
                </button>
              </>
            )}
            {projectRole === 'MEMBER' && (
              <span className="member-role-badge">Member Scoped View</span>
            )}
          </div>
        </div>

        {/* Mini Team member list */}
        <div className="board-team-list">
          <span className="team-list-label">Team Members:</span>
          {project.members.map((m, idx) => (
            <div 
              key={idx} 
              className="team-member-chip" 
              title={`${m.user.name} (${m.user.email}) - ${m.role}`}
            >
              <div className="avatar-chip">{m.user.name.charAt(0).toUpperCase()}</div>
              <span>{m.user.name}</span>
              <span className={`chip-role ${m.role.toLowerCase()}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="kanban-board">
        {/* TODO Column */}
        <div 
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'TODO')}
        >
          <div className="column-header">
            <h4 className="column-title">
              <span className="status-indicator todo"></span>
              To Do
            </h4>
            <span className="column-count">{getTasksByStatus('TODO').length}</span>
          </div>
          <div className="column-cards-container">
            {getTasksByStatus('TODO').map(task => (
              <div 
                key={task._id} 
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => handleTaskClick(task)}
              >
                <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ alignSelf: 'flex-start' }}>
                  {task.priority}
                </span>
                <div className="task-card-title">{task.title}</div>
                {task.description && <div className="task-card-desc">{task.description}</div>}
                
                <div className="task-meta">
                  <span className="task-date">
                    {task.dueDate ? `📅 ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </span>
                  {task.assignee ? (
                    <div 
                      className="assignee-avatar" 
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <span className="unassigned-avatar-placeholder">👤</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div 
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
        >
          <div className="column-header">
            <h4 className="column-title">
              <span className="status-indicator progress"></span>
              In Progress
            </h4>
            <span className="column-count">{getTasksByStatus('IN_PROGRESS').length}</span>
          </div>
          <div className="column-cards-container">
            {getTasksByStatus('IN_PROGRESS').map(task => (
              <div 
                key={task._id} 
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => handleTaskClick(task)}
              >
                <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ alignSelf: 'flex-start' }}>
                  {task.priority}
                </span>
                <div className="task-card-title">{task.title}</div>
                {task.description && <div className="task-card-desc">{task.description}</div>}
                
                <div className="task-meta">
                  <span className="task-date">
                    {task.dueDate ? `📅 ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </span>
                  {task.assignee ? (
                    <div 
                      className="assignee-avatar" 
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <span className="unassigned-avatar-placeholder">👤</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEW Column */}
        <div 
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'REVIEW')}
        >
          <div className="column-header">
            <h4 className="column-title">
              <span className="status-indicator review"></span>
              Under Review
            </h4>
            <span className="column-count">{getTasksByStatus('REVIEW').length}</span>
          </div>
          <div className="column-cards-container">
            {getTasksByStatus('REVIEW').map(task => (
              <div 
                key={task._id} 
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => handleTaskClick(task)}
              >
                <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ alignSelf: 'flex-start' }}>
                  {task.priority}
                </span>
                <div className="task-card-title">{task.title}</div>
                {task.description && <div className="task-card-desc">{task.description}</div>}
                
                <div className="task-meta">
                  <span className="task-date">
                    {task.dueDate ? `📅 ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </span>
                  {task.assignee ? (
                    <div 
                      className="assignee-avatar" 
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <span className="unassigned-avatar-placeholder">👤</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DONE Column */}
        <div 
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'DONE')}
        >
          <div className="column-header">
            <h4 className="column-title">
              <span className="status-indicator done"></span>
              Completed
            </h4>
            <span className="column-count">{getTasksByStatus('DONE').length}</span>
          </div>
          <div className="column-cards-container">
            {getTasksByStatus('DONE').map(task => (
              <div 
                key={task._id} 
                className="task-card task-card-done"
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => handleTaskClick(task)}
              >
                <span className="badge badge-done" style={{ alignSelf: 'flex-start' }}>
                  {task.priority}
                </span>
                <div className="task-card-title" style={{ textDecoration: 'line-through', opacity: 0.6 }}>{task.title}</div>
                {task.description && <div className="task-card-desc" style={{ opacity: 0.5 }}>{task.description}</div>}
                
                <div className="task-meta">
                  <span className="task-date">
                    Completed
                  </span>
                  {task.assignee ? (
                    <div 
                      className="assignee-avatar" 
                      style={{ opacity: 0.6 }}
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <span className="unassigned-avatar-placeholder">👤</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">Task Title</label>
            <input 
              id="taskTitle"
              type="text" 
              placeholder="e.g. Design Login Page" 
              className="glass-input"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDesc">Description</label>
            <textarea 
              id="taskDesc"
              placeholder="Detailed instructions for the assignee..." 
              className="glass-input"
              rows="3"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="form-row-double">
            <div className="form-group">
              <label className="form-label" htmlFor="taskPrio">Priority</label>
              <select 
                id="taskPrio"
                className="glass-input"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="taskDate">Due Date</label>
              <input 
                id="taskDate"
                type="date" 
                className="glass-input"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskAss">Assignee</label>
            <select 
              id="taskAss"
              className="glass-input"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {/* Project Members list only */}
              {project.members.map(m => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name} ({m.user.role === 'ADMIN' ? 'Admin' : 'Member'})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer-btns">
            <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={taskLoading}>
              {taskLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Invite Team Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Manage Project Team">
        <div className="team-management-panel">
          {projectRole === 'ADMIN' && (
            <form onSubmit={handleAddMember} className="invite-form-wrapper">
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>Add Team Member</h4>
              <div className="invite-inputs">
                {(() => {
                  const availableUsers = project && project.members 
                    ? allRegisteredUsers.filter(u => !project.members.some(m => m.user && m.user.email === u.email))
                    : allRegisteredUsers;

                  return (
                    <>
                      <select 
                        className="glass-input invite-email-selector"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        required
                        disabled={availableUsers.length === 0}
                      >
                        {availableUsers.length === 0 ? (
                          <option value="">All registered users are in the team</option>
                        ) : (
                          <>
                            <option value="">Select User from System...</option>
                            {availableUsers.map(u => (
                              <option key={u.email} value={u.email}>{u.name} ({u.email})</option>
                            ))}
                          </>
                        )}
                      </select>

                      <select 
                        className="glass-input invite-role-selector"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        disabled={availableUsers.length === 0}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button type="submit" className="btn btn-primary invite-btn" disabled={memberLoading || availableUsers.length === 0}>
                        {memberLoading ? 'Adding...' : 'Add'}
                      </button>
                    </>
                  );
                })()}
              </div>
            </form>
          )}

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>Active Team ({project.members.length})</h4>
          <div className="team-members-list-box">
            {project.members.map(m => {
              const isProjOwner = project.owner && project.owner._id === m.user._id;
              
              return (
                <div key={m.user._id} className="team-member-row-item">
                  <div className="row-item-left">
                    <div className="avatar-chip">{m.user.name.charAt(0).toUpperCase()}</div>
                    <div className="member-row-details">
                      <div className="member-row-name">
                        {m.user.name}
                        {isProjOwner && <span className="owner-badge">Owner</span>}
                      </div>
                      <div className="member-row-email">{m.user.email}</div>
                    </div>
                  </div>
                  <div className="row-item-right">
                    <span className={`chip-role ${m.role.toLowerCase()}`}>{m.role}</span>
                    {projectRole === 'ADMIN' && !isProjOwner && m.user._id !== user.id && (
                      <button 
                        onClick={() => handleRemoveMember(m.user._id)} 
                        className="btn-remove-icon"
                        title="Remove member"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Interactive Task Details / Edit Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Task Actions">
        {selectedTask && (
          <form onSubmit={handleUpdateTask}>
            {/* View Mode Details */}
            {!editMode ? (
              <div className="task-detail-view-mode">
                <div className="detail-status-bar">
                  <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>
                    Priority: {selectedTask.priority}
                  </span>
                  <span className={`badge badge-${selectedTask.status.toLowerCase() === 'in_progress' ? 'progress' : selectedTask.status.toLowerCase()}`}>
                    Status: {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="task-detail-title-txt">{selectedTask.title}</h3>
                <p className="task-detail-desc-txt">
                  {selectedTask.description || <span className="text-muted">No description provided for this task.</span>}
                </p>

                <div className="detail-meta-grid">
                  <div className="meta-grid-item">
                    <span className="meta-label">Assignee</span>
                    <span className="meta-val">
                      {selectedTask.assignee ? selectedTask.assignee.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="meta-grid-item">
                    <span className="meta-label">Due Date</span>
                    <span className="meta-val">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>

                  <div className="meta-grid-item">
                    <span className="meta-label">Creator</span>
                    <span className="meta-val">
                      {selectedTask.creator ? selectedTask.creator.name : 'System'}
                    </span>
                  </div>
                </div>

                {/* Member Scoped view: Show simple status switcher if task is assigned to them */}
                {projectRole === 'MEMBER' && selectedTask.assignee && selectedTask.assignee._id === user.id && (
                  <div className="member-status-selector-row">
                    <label className="form-label" htmlFor="memStat">Change Status:</label>
                    <select
                      id="memStat"
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
                )}

                <div className="detail-view-footer">
                  {/* ADMIN actions */}
                  {projectRole === 'ADMIN' && (
                    <div className="admin-view-btns">
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteTask(selectedTask._id)}
                      >
                        🗑️ Delete
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setEditMode(true)}
                      >
                        ✏️ Edit Details
                      </button>
                    </div>
                  )}

                  {/* Member save button (if status changed) */}
                  {projectRole === 'MEMBER' && selectedTask.assignee && selectedTask.assignee._id === user.id ? (
                    <button type="submit" className="btn btn-primary" disabled={editLoading}>
                      {editLoading ? 'Saving...' : 'Update Status'}
                    </button>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Admin Edit Mode */
              <div className="task-detail-edit-mode">
                <div className="form-group">
                  <label className="form-label" htmlFor="editTitle">Title</label>
                  <input 
                    id="editTitle"
                    type="text" 
                    className="glass-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editDesc">Description</label>
                  <textarea 
                    id="editDesc"
                    className="glass-input"
                    rows="3"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label" htmlFor="editStatus">Status</label>
                    <select 
                      id="editStatus"
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

                  <div className="form-group">
                    <label className="form-label" htmlFor="editPrio">Priority</label>
                    <select 
                      id="editPrio"
                      className="glass-input"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label" htmlFor="editAss">Assignee</label>
                    <select 
                      id="editAss"
                      className="glass-input"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {project.members.map(m => (
                        <option key={m.user._id} value={m.user._id}>
                          {m.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="editDue">Due Date</label>
                    <input 
                      id="editDue"
                      type="date" 
                      className="glass-input"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer-btns">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </Modal>

      <style>{`
        .board-top-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .board-info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .board-info-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .back-link {
          font-size: 0.8rem;
          color: var(--color-purple);
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 0.25rem;
        }

        .project-detail-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          font-family: var(--font-heading);
          background: linear-gradient(135deg, #ffffff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .project-detail-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          line-height: 1.4;
        }

        .board-actions-group {
          display: flex;
          gap: 0.75rem;
        }

        .member-role-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .board-team-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .team-list-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-right: 0.25rem;
        }

        .team-member-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .avatar-chip {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-purple);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 700;
        }

        .chip-role {
          font-size: 0.55rem;
          font-weight: 800;
          padding: 0.05rem 0.3rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .chip-role.admin { background: rgba(139, 92, 246, 0.1); color: #c084fc; }
        .chip-role.member { background: rgba(6, 182, 212, 0.1); color: #67e8f9; }

        /* Kanban Column custom overrides */
        .column-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-indicator.todo { background: var(--text-muted); box-shadow: 0 0 8px var(--text-muted); }
        .status-indicator.progress { background: var(--color-cyan); box-shadow: var(--glow-cyan); }
        .status-indicator.review { background: var(--color-purple); box-shadow: var(--glow-purple); }
        .status-indicator.done { background: var(--color-emerald); box-shadow: var(--glow-emerald); }

        .task-card-done {
          border-color: rgba(16, 185, 129, 0.05);
          background: rgba(10, 20, 15, 0.2);
        }

        .unassigned-avatar-placeholder {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .form-row-double {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        /* Team management popup styles */
        .team-management-panel {
          display: flex;
          flex-direction: column;
        }

        .invite-form-wrapper {
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .invite-inputs {
          display: grid;
          grid-template-columns: 2.2fr 1fr auto;
          gap: 0.5rem;
          align-items: center;
        }

        .invite-email-selector,
        .invite-role-selector {
          width: 100%;
        }

        .invite-btn {
          padding: 0.65rem 1.25rem;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .team-members-list-box {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-right: 0.25rem;
        }

        /* Custom scrollbar for members list */
        .team-members-list-box::-webkit-scrollbar {
          width: 6px;
        }
        .team-members-list-box::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .team-members-list-box::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }
        .team-members-list-box::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .team-member-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .team-member-row-item:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .row-item-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .team-member-row-item .avatar-chip {
          width: 32px;
          height: 32px;
          font-size: 0.85rem;
          background: linear-gradient(135deg, var(--color-purple), #4f46e5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 10px rgba(139, 92, 246, 0.15);
          flex-shrink: 0;
        }

        .member-row-details {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }

        .member-row-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .owner-badge {
          font-size: 0.55rem;
          font-weight: 800;
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
          margin-left: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: inline-block;
          flex-shrink: 0;
        }

        .member-row-email {
          font-size: 0.7rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .row-item-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .team-member-row-item .chip-role {
          font-size: 0.6rem;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .btn-remove-icon {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
          cursor: pointer;
          font-size: 0.7rem;
          padding: 0.25rem 0.45rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-remove-icon:hover {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.35);
          transform: scale(1.05);
        }

        /* 👥 Team Modal Responsive Queries */
        @media (max-width: 576px) {
          .invite-inputs {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .invite-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .team-member-row-item {
            padding: 0.5rem 0.65rem;
            border-radius: 10px;
          }
          .row-item-left {
            gap: 0.65rem;
            min-width: 0;
          }
          .team-member-row-item .avatar-chip {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }
          .member-row-name {
            font-size: 0.8rem;
          }
          .member-row-email {
            font-size: 0.65rem;
          }
          .team-member-row-item .chip-role {
            font-size: 0.55rem;
            padding: 0.1rem 0.35rem;
          }
          .btn-remove-icon {
            padding: 0.2rem 0.4rem;
            font-size: 0.65rem;
          }
        }

        /* Detail Modal views */
        .task-detail-view-mode {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-status-bar {
          display: flex;
          gap: 0.5rem;
        }

        .task-detail-title-txt {
          font-size: 1.35rem;
          font-weight: 700;
          color: white;
          font-family: var(--font-heading);
          line-height: 1.3;
        }

        .task-detail-desc-txt {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 8px;
          min-height: 80px;
        }

        .detail-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.015);
          padding: 1rem;
          border-radius: 10px;
        }

        .meta-grid-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .meta-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .meta-val {
          font-size: 0.85rem;
          color: white;
          font-weight: 500;
        }

        .member-status-selector-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px dashed rgba(255, 255, 255, 0.05);
        }

        .detail-view-footer {
          margin-top: 1rem;
          display: flex;
          justify-content: flex-end;
        }

        .admin-view-btns {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;
