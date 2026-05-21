const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Get all projects user belongs to
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // 2. Fetch all tasks within these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignee', 'name email role');

    const totalTasks = tasks.length;
    
    // Status counts
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const reviewTasks = tasks.filter(t => t.status === 'REVIEW').length;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;

    // Overdue tasks: dueDate < now and status != DONE
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'DONE'
    ).length;

    // Priority breakdown
    const lowPriority = tasks.filter(t => t.priority === 'LOW').length;
    const mediumPriority = tasks.filter(t => t.priority === 'MEDIUM').length;
    const highPriority = tasks.filter(t => t.priority === 'HIGH').length;

    // Tasks assigned to current user
    const myTasks = tasks.filter(t => t.assignee && t.assignee._id.toString() === req.user.id.toString());
    const myTasksCount = myTasks.length;
    const myCompletedTasksCount = myTasks.filter(t => t.status === 'DONE').length;

    // Project summary: projects with their task completion metrics
    const projectSummary = projects.map(p => {
      const projectTasks = tasks.filter(t => t.project._id.toString() === p._id.toString());
      const total = projectTasks.length;
      const completed = projectTasks.filter(t => t.status === 'DONE').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        id: p._id,
        name: p.name,
        totalTasks: total,
        completedTasks: completed,
        completionRate,
        ownerName: p.owner === req.user.id ? 'You' : 'Others'
      };
    });

    // Recent tasks (last 5 created)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        doneTasks,
        overdueTasks,
        priority: {
          low: lowPriority,
          medium: mediumPriority,
          high: highPriority
        },
        myTasks: {
          total: myTasksCount,
          completed: myCompletedTasksCount,
          pending: myTasksCount - myCompletedTasksCount
        },
        projectSummary,
        recentTasks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error computing dashboard stats', error: error.message });
  }
};
