const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found with this token' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Global Role verification
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Project Access Guard
// Resolves project ID from params (projectId or id) or body,
// and checks if user is the Owner OR a Project Member.
// Optionally checks if project-level 'ADMIN' role is required.
const projectAccess = (adminRequired = false) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required for this operation' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Check if user is owner
      const isOwner = project.owner.toString() === req.user.id;
      
      // Check if user is member
      const membership = project.members.find(
        (m) => m.user.toString() === req.user.id
      );

      if (!isOwner && !membership) {
        // Not a member or owner
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this project'
        });
      }

      // If admin required, must be owner or have ADMIN role in project
      if (adminRequired && !isOwner && (!membership || membership.role !== 'ADMIN')) {
        return res.status(403).json({
          success: false,
          message: 'Project administrator privileges required'
        });
      }

      // Attach project and user role for down-stream use
      req.project = project;
      req.projectRole = isOwner ? 'ADMIN' : membership.role;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error checking project permissions', error: error.message });
    }
  };
};

module.exports = { protect, authorize, projectAccess };
