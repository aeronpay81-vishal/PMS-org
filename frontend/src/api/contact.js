import apiClient from './admin'

export const contactAPI = {
  submit: async (payload) => {
    try {
      const response = await apiClient.post('/contact', payload)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message || 'Unable to send your message'
    }
  },

  list: async (limit = 500) => {
    try {
      const response = await apiClient.get('/contact/submissions', { params: { limit } })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message || 'Unable to load contact messages'
    }
  },

  markRead: async (messageId) => {
    try {
      const response = await apiClient.patch(`/contact/submissions/${messageId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message || 'Unable to mark contact message as read'
    }
  },
}
