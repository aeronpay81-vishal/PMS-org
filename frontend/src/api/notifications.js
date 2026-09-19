import apiClient from './admin'

export const notificationsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/notifications')
    return response.data
  },

  markRead: async (notificationId) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAllRead: async () => {
    const response = await apiClient.patch('/notifications/read-all')
    return response.data
  },
}
