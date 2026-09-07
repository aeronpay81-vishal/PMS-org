import apiClient from './admin'

// ==================== Projects API ====================
export const projectsAPI = {
  // Get all projects for user
  getAll: async () => {
    try {
      const response = await apiClient.get('/projects')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single project by ID
  getById: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get users who have accepted membership in a project
  getMembers: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/members`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create new project
  create: async (projectData, useFormData = false) => {
    try {
      let config = {};
      let data = projectData;

      // If useFormData is true, don't set Content-Type (let browser handle it for multipart)
      if (useFormData) {
        config.headers = {
          // Remove Content-Type to let browser set it automatically with boundary
          'Content-Type': undefined,
        };
      }

      const response = await apiClient.post('/projects', data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update existing project
  update: async (projectId, projectData, useFormData = false) => {
    try {
      let config = {};
      let data = projectData;

      // If useFormData is true, don't set Content-Type (let browser handle it for multipart)
      if (useFormData) {
        config.headers = {
          // Remove Content-Type to let browser set it automatically with boundary
          'Content-Type': undefined,
        };
      }

      const response = await apiClient.put(`/projects/${projectId}`, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete project
  delete: async (projectId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

// ==================== Project Reports API ====================
export const reportsAPI = {
  // Get all reports for a project
  getAll: async (projectId) => {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/reports`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single report
  getById: async (projectId, reportId) => {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/reports/${reportId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create new report (with optional file upload)
  create: async (projectId, reportData, file = null) => {
    try {
      const formData = new FormData()
      formData.append('title', reportData.title)
      formData.append('content', reportData.content)
      
      if (file) {
        formData.append('file', file)
      }

      const response = await apiClient.post(
        `/api/projects/${projectId}/reports`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete report
  delete: async (projectId, reportId) => {
    try {
      const response = await apiClient.delete(`/api/projects/${projectId}/reports/${reportId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}


export default apiClient