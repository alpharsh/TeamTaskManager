const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks for current user across their projects
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // First, find all projects current user has access to
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Build filter
    let filter = { project: { $in: projectIds } };

    // Apply additional filters from query parameters
    if (req.query.project) {
      filter.project = req.query.project;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.assignedToMe === 'true') {
      filter.assignee = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'name email role')
      .populate('creator', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving tasks', error: error.message });
  }
};

// @desc    Create a task within a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private (projectAccess(true) - Admin Required)
exports.createTask = async (req, res) => {
  const { title, description, priority, dueDate, assignee } = req.body;
  const projectId = req.params.projectId;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Please provide a task title' });
  }

  try {
    const project = req.project; // Pre-fetched by projectAccess

    // If assignee is provided, verify they are a member of the project
    if (assignee) {
      const isMember = project.members.some(
        (m) => m.user.toString() === assignee.toString()
      );
      const isOwner = project.owner.toString() === assignee.toString();

      if (!isMember && !isOwner) {
        return res.status(400).json({ success: false, message: 'Assignee must be a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'MEDIUM',
      dueDate,
      project: projectId,
      assignee: assignee || null,
      creator: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email role')
      .populate('creator', 'name email role');

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating task', error: error.message });
  }
};

// @desc    Update a task (RBAC rules applied)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;

  try {
    const task = await Task.findById(req.id || req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Fetch the project to determine the user's role in it
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Parent project not found' });
    }

    const isOwner = project.owner.toString() === req.user.id;
    const membership = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!isOwner && !membership) {
      return res.status(403).json({ success: false, message: 'You do not have access to this project\'s tasks' });
    }

    const projectRole = isOwner ? 'ADMIN' : membership.role;

    // RBAC: Implement authorization levels
    if (projectRole === 'MEMBER') {
      // Members can ONLY update status, and ONLY if the task is assigned to them
      if (task.assignee && task.assignee.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update the status of tasks assigned to themselves'
        });
      }

      // Check if they tried to update restricted fields
      if (title || description || priority || dueDate || assignee) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status. Restricting edits to title, priority, assignee, etc.'
        });
      }

      // Restrict update to status only
      task.status = status || task.status;
    } else {
      // Admins (or Owners) can update anything!
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      
      if (assignee !== undefined) {
        if (assignee === null || assignee === '') {
          task.assignee = null;
        } else {
          // Verify new assignee is a member of the project
          const isMember = project.members.some(
            (m) => m.user.toString() === assignee.toString()
          );
          const isOwnerAssignee = project.owner.toString() === assignee.toString();
          if (!isMember && !isOwnerAssignee) {
            return res.status(400).json({ success: false, message: 'Assignee must be a member of this project' });
          }
          task.assignee = assignee;
        }
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email role')
      .populate('creator', 'name email role');

    res.status(200).json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating task', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check project admin privileges
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Parent project not found' });
    }

    const isOwner = project.owner.toString() === req.user.id;
    const membership = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    const projectRole = isOwner ? 'ADMIN' : (membership ? membership.role : null);

    if (projectRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Project administrator privileges required to delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting task', error: error.message });
  }
};
