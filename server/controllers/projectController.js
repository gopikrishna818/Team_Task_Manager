import Project from '../models/Project.js';
import User from '../models/User.js';

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get projects where user is a member
    const projects = await Project.find({
      'members.userId': userId,
    });

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is member (handle populated userId objects or raw ObjectId)
    const isMember = project.members.some((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    });
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: userId,
      members: [
        {
          userId,
          role: 'Admin',
        },
      ],
    });

    await project.populate({
      path: 'members.userId createdBy',
      select: 'name email avatar',
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const userMember = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    });
    if (!userMember || userMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can update projects' });
    }

    if (name) project.name = name.trim();
    if (description) project.description = description.trim();

    await project.save();

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const userMember = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    });
    if (!userMember || userMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email, role = 'Member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const userMember = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    });
    if (!userMember || userMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Find user by email
    const newUser = await User.findOne({ email: email.toLowerCase() });
    if (!newUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some((m) => m.userId.toString() === newUser._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({
      userId: newUser._id,
      role,
    });

    await project.save();
    await project.populate({
      path: 'members.userId',
      select: 'name email avatar',
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const userMember = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === req.user.userId.toString();
    });
    if (!userMember || userMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Don't allow removing the last admin
    const adminCount = project.members.filter((m) => m.role === 'Admin').length;
    const memberObj = project.members.find((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return mid && mid.toString() === memberId.toString();
    });
    const isLastAdmin = adminCount === 1 && memberObj?.role === 'Admin';

    if (isLastAdmin) {
      return res.status(400).json({ message: 'Cannot remove the last admin' });
    }

    project.members = project.members.filter((m) => {
      const mid = m.userId && (m.userId._id ? m.userId._id : m.userId);
      return !(mid && mid.toString() === memberId.toString());
    });

    await project.save();
    await project.populate({
      path: 'members.userId',
      select: 'name email avatar',
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
};
