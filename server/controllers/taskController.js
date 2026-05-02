import Task from '../models/Task.js';
import Project from '../models/Project.js';

// ── Normalize a populated task to flat frontend-friendly shape ─────────────
function normalizeTask(task) {
  const t = task.toObject ? task.toObject() : { ...task };
  // Flatten assignedTo
  if (t.assignedTo && typeof t.assignedTo === 'object') {
    t.assignedToName  = t.assignedTo.name  || '';
    t.assignedToEmail = t.assignedTo.email || '';
    t.assignedTo      = t.assignedTo._id?.toString() || t.assignedTo.toString();
  }
  // Flatten createdBy
  if (t.createdBy && typeof t.createdBy === 'object') {
    t.createdBy = t.createdBy._id?.toString() || t.createdBy.toString();
  }
  // Flatten projectId → also expose projectName
  if (t.projectId && typeof t.projectId === 'object') {
    t.projectName = t.projectId.name || '';
    t.projectId   = t.projectId._id?.toString() || t.projectId.toString();
  }
  // Ensure `id` alias
  t.id = t._id?.toString() || t.id;
  return t;
}

export const getTasks = async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const userId = req.user.userId;

    // Get user's projects
    const userProjects = await Project.find({
      'members.userId': userId,
    });

    const query = {
      projectId: { $in: userProjects.map((p) => p._id) },
    };

    if (projectId) {
      // Verify user is member of this project
      const project = userProjects.find((p) => p._id.toString() === projectId);
      if (!project) {
        return res.status(403).json({ message: 'Not authorized to view tasks in this project' });
      }
      query.projectId = projectId;
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json(tasks.map(normalizeTask));
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user is member of the project
    const project = await Project.findById(task.projectId);
    const isMember = project.members.some((m) => m.userId.toString() === req.user.userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }

    if (!assignedTo) {
      return res.status(400).json({ message: 'Assigned to is required' });
    }

    // Check if project exists and user is admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userRole = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === userId.toString();
    })?.role;
    if (userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }

    // Verify assignedTo user is a member
    const assignedMember = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === assignedTo.toString();
    });
    if (!assignedMember) {
      return res.status(400).json({ message: 'Assigned user is not a project member' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      projectId,
      assignedTo,
      createdBy: userId,
      priority: priority || 'Medium',
      dueDate,
    });

    await task.populate({
      path: 'assignedTo createdBy projectId',
      select: 'name email avatar',
    });

    res.status(201).json(normalizeTask(task));
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get project to check permissions
    const project = await Project.findById(task.projectId);
    const userRole = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    })?.role;

    // Members can only update status of their own tasks
    if (userRole !== 'Admin') {
      if (task.assignedTo.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      // Members can only update status
      if (title || description || priority || dueDate || assignedTo) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) {
      const assignedMember = project.members.find((m) => {
        const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
        return mid && mid.toString() === assignedTo.toString();
      });
      if (!assignedMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate({ path: 'assignedTo createdBy projectId', select: 'name email avatar' });

    res.json(normalizeTask(task));
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Populate members so the userId field is a full object (consistent with createTask)
    const project = await Project.findById(task.projectId).populate('members.userId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userRole = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    })?.role;

    if (userRole !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);

  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const tasks = await Task.find({ assignedTo: userId }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};
