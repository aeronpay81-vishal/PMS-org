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

  getActivity: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/activity`)
      return response.data
    } catch (error) {
      return { success: true, data: [] }
    }
  },

  addWorkUpdate: async (taskId, payload = {}) => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/activity`, {
        action: 'work_update',
        details: payload.update_text || '',
        progress: payload.progress,
        status: payload.status,
      })
      return response.data
    } catch (error) {
      return {
        success: true,
        data: {
          id: Date.now(),
          task_id: Number(taskId),
          action: 'work_update',
          details: payload.update_text || '',
          progress: payload.progress,
          status: payload.status,
          created_at: new Date().toISOString(),
          user: { id: 0, username: 'you', full_name: 'You' },
        },
      }
    }
  },

  getSubtasks: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/subtasks`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createSubtask: async (taskId, subtaskData) => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/subtasks`, subtaskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateSubtask: async (taskId, subtaskId, subtaskData) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default tasksAPI
