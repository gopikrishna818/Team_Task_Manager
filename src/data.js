import axios from 'axios';

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Store token in localStorage
const TOKEN_KEY = 'taskflow_token';

// Create axios instance with token
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const genToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const parseToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch {
    return null;
  }
};

// Store for tracking current user
export const DB = {
  currentUser: null,
};

// ── API Layer ──────────────────────────────────────────────────────────────────
export const api = {
  // ─────── Auth ───────────
  async login(email, password) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      genToken(res.data.token);
      DB.currentUser = res.data.user;
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  },

  async signup(name, email, password) {
    try {
      const res = await apiClient.post('/auth/signup', { name, email, password });
      genToken(res.data.token);
      DB.currentUser = res.data.user;
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Signup failed');
    }
  },

  // ─────── Projects ───────────
  async getProjects(userId) {
    try {
      const res = await apiClient.get('/projects');
      // Normalize _id -> id and member user shapes for frontend convenience
      const projects = Array.isArray(res.data)
        ? res.data.map((p) => normalizeProject(p))
        : [];
      return projects;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch projects');
    }
  },

  async getProjectById(projectId) {
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      return normalizeProject(res.data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch project');
    }
  },

  async createProject(userId, { name, description }) {
    try {
      const res = await apiClient.post('/projects', { name, description });
      return normalizeProject(res.data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create project');
    }
  },

  async deleteProject(userId, projectId) {
    try {
      await apiClient.delete(`/projects/${projectId}`);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete project');
    }
  },

  async addMember(userId, projectId, memberEmail, role = 'Member') {
    try {
      const res = await apiClient.post(`/projects/${projectId}/members`, { email: memberEmail, role });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add member');
    }
  },

  async removeMember(userId, projectId, memberId) {
    try {
      const res = await apiClient.delete(`/projects/${projectId}/members`, {
        data: { memberId },
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove member');
    }
  },

  // ─────── Tasks ───────────
  async getTasks(userId, projectId) {
    try {
      const res = await apiClient.get('/tasks', {
        params: { projectId },
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  async getTaskById(taskId) {
    try {
      const res = await apiClient.get(`/tasks/${taskId}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch task');
    }
  },

  async createTask(userId, projectId, data) {
    try {
      const res = await apiClient.post('/tasks', {
        ...data,
        projectId,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create task');
    }
  },

  async updateTask(userId, projectId, taskId, data) {
    try {
      const res = await apiClient.put(`/tasks/${taskId}`, data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update task');
    }
  },

  async deleteTask(userId, projectId, taskId) {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete task');
    }
  },

  // ─────── Dashboard ───────────
  async getDashboard(userId) {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch dashboard');
    }
  },
};

// Helper: normalize server project to frontend-friendly shape
function normalizeProject(p) {
  if (!p) return p;
  const proj = { ...p };
  // ensure id alias
  proj.id = proj.id || proj._id || (proj._id && proj._id.toString());
  // createdAt
  proj.createdAt = proj.createdAt || (proj._id ? new Date().toISOString().split('T')[0] : undefined);
  // normalize members array: ensure userId and userName/email available
  proj.members = (proj.members || []).map((m) => {
    const userObj = m.userId || {};
    return {
      userId: userObj._id || userObj.id || userObj || m.userId,
      userName: userObj.name || userObj?.name || userObj?.fullName || (userObj && userObj.toString && userObj.toString()),
      userEmail: userObj.email || userObj?.email,
      role: m.role || 'Member',
    };
  });
  return proj;
}
