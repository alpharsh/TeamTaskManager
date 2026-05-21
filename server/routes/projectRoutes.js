const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectController');
const { createTask } = require('../controllers/taskController');
const { protect, projectAccess } = require('../middleware/auth');

// Base routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

// Detail routes
router.route('/:id')
  .get(protect, projectAccess(false), getProjectById);

// Team membership routes
router.route('/:id/members')
  .post(protect, projectAccess(true), addProjectMember);

router.route('/:id/members/:userId')
  .delete(protect, projectAccess(true), removeProjectMember);

// Task creation nested route
router.route('/:projectId/tasks')
  .post(protect, projectAccess(true), createTask);

module.exports = router;
