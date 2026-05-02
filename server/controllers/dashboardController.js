import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user's projects
    const projects = await Project.find({
      'members.userId': userId,
    }).populate('members.userId', 'name email avatar');

    const projectIds = projects.map((p) => p._id);

    // Get all tasks in user's projects
    const allTasks = await Task.find({
      projectId: { $in: projectIds },
    });

    // Get user's assigned tasks
    const myTasks = await Task.find({
      assignedTo: userId,
    });

    // Calculate dashboard metrics
    const byStatus = {
      'To Do': allTasks.filter((t) => t.status === 'To Do').length,
      'In Progress': allTasks.filter((t) => t.status === 'In Progress').length,
      Done: allTasks.filter((t) => t.status === 'Done').length,
    };

    const overdue = allTasks.filter((t) => t.status !== 'Done' && new Date() > new Date(t.dueDate)).length;

    // Get workload by user
    const byUser = [];
    projects.forEach((p) => {
      p.members.forEach((m) => {
        const count = allTasks.filter((t) => t.assignedTo.toString() === m.userId._id.toString()).length;
        const existing = byUser.find((b) => b.user.id.toString() === m.userId._id.toString());
        if (existing) {
          existing.count += count;
        } else {
          byUser.push({
            user: {
              id: m.userId._id,
              name: m.userId.name,
              avatar: m.userId.avatar,
            },
            count,
          });
        }
      });
    });

    // Recent tasks
    const recentTasks = allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    res.json({
      projects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      overdue,
      byStatus,
      byUser: byUser.sort((a, b) => b.count - a.count),
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};
