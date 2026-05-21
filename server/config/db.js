const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/team-task-manager';
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully`);
    
    // Seed initial data if database is empty
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    const User = require('../models/User');
    const Project = require('../models/Project');
    const Task = require('../models/Task');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping database seeding.');
      return;
    }

    console.log('Seeding initial demo data...');

    // 1. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const memberPass = await bcrypt.hash('member123', salt);

    const adminUser = await User.create({
      name: 'Aero Admin',
      email: 'admin@aerotask.com',
      password: adminPass,
      role: 'ADMIN'
    });

    const memberUser = await User.create({
      name: 'Alex Member',
      email: 'rishmember@aerotask.com',
      password: memberPass,
      role: 'MEMBER'
    });

    console.log('Demo Users seeded successfully: admin@aerotask.com / rishmember@aerotask.com');

    // 2. Create Sample Project
    const sampleProject = await Project.create({
      name: 'AeroTask Web App Redesign',
      description: 'The main workspace for designing, coding, testing, and shipping the high-fidelity glassmorphic dashboard web application.',
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: 'ADMIN' },
        { user: memberUser._id, role: 'MEMBER' }
      ]
    });

    console.log(`Sample Project seeded: "${sampleProject.name}"`);

    // 3. Create Sample Tasks across columns
    const now = new Date();
    
    // Task 1: DONE
    await Task.create({
      title: 'Design UI Design System (Glassmorphic theme)',
      description: 'Finalize the background colors, gradients, font structures, and active shadows for components like Sidebar, Buttons, Input fields, and Modals.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      project: sampleProject._id,
      assignee: adminUser._id,
      creator: adminUser._id
    });

    // Task 2: REVIEW
    await Task.create({
      title: 'Build Express Rest APIs & JWT Middleware',
      description: 'Implement backend router files, authentication verification logic, project roles access controller, and dashboard metric calculations.',
      status: 'REVIEW',
      priority: 'HIGH',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      project: sampleProject._id,
      assignee: adminUser._id,
      creator: adminUser._id
    });

    // Task 3: IN PROGRESS
    await Task.create({
      title: 'Develop Interactive Kanban Board Page',
      description: 'Connect HTML5 drag and drop APIs, design reactive CSS layout columns, and wire modal windows for task additions and project team lists.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      project: sampleProject._id,
      assignee: memberUser._id,
      creator: adminUser._id
    });

    // Task 4: TODO
    await Task.create({
      title: 'Write QA Test Suite & API Endpoint Mockers',
      description: 'Conduct manual and automated testing of JWT session expiries, role boundaries restrictions, and responsive sidebar drawer layouts.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      project: sampleProject._id,
      assignee: memberUser._id,
      creator: adminUser._id
    });

    // Task 5: OVERDUE Task (TODO status, past deadline)
    await Task.create({
      title: 'Finalize Railway Deployment & hosted MongoDB Atlas Link',
      description: 'Provision containerized server hosting on Railway service, wire environment variables, and verify builds bundle bundles successfully.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Overdue by 1 day
      project: sampleProject._id,
      assignee: null,
      creator: adminUser._id
    });

    console.log('Sample Tasks seeded successfully!');
  } catch (error) {
    console.error('Failed to seed demo data', error.message);
  }
};

module.exports = connectDB;
