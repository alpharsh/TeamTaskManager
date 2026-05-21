const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    // Find projects where user is owner OR a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('owner', 'name email role')
    .populate('members.user', 'name email role')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving projects', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Please provide a project name' });
  }

  try {
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'ADMIN' }] // Owner is automatically an ADMIN member
    });

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating project', error: error.message });
  }
};

// @desc    Get detailed project by ID
// @route   GET /api/projects/:id
// @access  Private (projectAccess check)
exports.getProjectById = async (req, res) => {
  try {
    // Already loaded by projectAccess middleware
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');

    // Get all tasks related to this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email role')
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      project,
      role: req.projectRole, // Attached by projectAccess middleware
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching project details', error: error.message });
  }
};

// @desc    Add member to a project
// @route   POST /api/projects/:id/members
// @access  Private (projectAccess(true) - Admin Required)
exports.addProjectMember = async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide user email to invite' });
  }

  try {
    // Find user to invite
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email' });
    }

    const project = req.project; // Attached by projectAccess

    // Check if user is already a member
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === invitedUser._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    // Add member to array
    project.members.push({
      user: invitedUser._id,
      role: role || 'MEMBER'
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding member', error: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (projectAccess(true) - Admin Required)
exports.removeProjectMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    if (project.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    await project.save();

    // Re-assign tasks assigned to this removed member to null
    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } }
    );

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error removing member', error: error.message });
  }
};
