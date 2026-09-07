import axios from 'axios'


const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ==================== Authentication API ====================

export const authAPI = {
  register: async (username, email, password, full_name, role = 'user') => {
    try {
      const response = await apiClient.post('/auth/signup', {
        username,
        email,
        password,
        full_name,
        role,
      })
      const data = response.data.data || response.data

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return response.data
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Signup failed'
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })
      const data = response.data.data || response.data

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return response.data
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed'
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUsers: async (role = null) => {
    try {
      const params = {};
      if (role) params.role = role;
      const response = await apiClient.get('/auth/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getStoredRole: () => {
    const user = localStorage.getItem('user');
    if (!user) return 'user';
    try {
      const parsed = JSON.parse(user);
      return parsed.role || 'user';
    } catch {
      return 'user';
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// ==================== Projects API ====================
export const projectsAPI = {
  inviteToProject: async (projectId, email, role = 'member') => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/invite`, {
        email,
        role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPendingInvitations: async () => {
    try {
      const response = await apiClient.get('/invitations/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  acceptInvitation: async (token) => {
    try {
      const response = await apiClient.post('/invitations/accept', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  declineInvitation: async (invitationId) => {
    try {
      const response = await apiClient.post(`/invitations/${invitationId}/decline`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}

export default apiClient;
