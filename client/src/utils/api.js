const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Core Fetch Wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear storage and redirect
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login?expired=true';
        }
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// API Endpoint Helper Methods
export const api = {
  // Auth Operations
  auth: {
    login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => apiFetch('/auth/register', { method: 'POST', body: userData }),
    getMe: () => apiFetch('/auth/me'),
    getUsers: () => apiFetch('/auth/users')
  },
  
  // Projects Operations
  projects: {
    getAll: () => apiFetch('/projects'),
    create: (projectData) => apiFetch('/projects', { method: 'POST', body: projectData }),
    getById: (id) => apiFetch(`/projects/${id}`),
    addMember: (projectId, memberData) => apiFetch(`/projects/${projectId}/members`, { method: 'POST', body: memberData }),
    removeMember: (projectId, userId) => apiFetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
  },
  
  // Tasks Operations
  tasks: {
    getAll: (filters = {}) => {
      const queryParams = new URLSearchParams();
      if (filters.project) queryParams.append('project', filters.project);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.assignedToMe) queryParams.append('assignedToMe', 'true');
      
      const queryString = queryParams.toString();
      return apiFetch(`/tasks${queryString ? `?${queryString}` : ''}`);
    },
    create: (projectId, taskData) => apiFetch(`/projects/${projectId}/tasks`, { method: 'POST', body: taskData }),
    update: (taskId, taskData) => apiFetch(`/tasks/${taskId}`, { method: 'PUT', body: taskData }),
    delete: (taskId) => apiFetch(`/tasks/${taskId}`, { method: 'DELETE' })
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => apiFetch('/dashboard/stats')
  }
};
