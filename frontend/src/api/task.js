import apiClient from './admin'

export const tasksAPI = {
  // Get all tasks (with optional project_id filter)
  getAll: async (projectId = null) => {
    try {
      const config = projectId ? { params: { project_id: projectId } } : {}
      const response = await apiClient.get('/tasks', config)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single task by ID
  getById: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create new task
  create: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', taskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  //  fg  gfj Update existing task  //  fg  gfj Update existing task

  update: async (taskId, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update task status directly
  updateStatus: async (taskId, status) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete task
  delete: async (taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default tasksAPI
