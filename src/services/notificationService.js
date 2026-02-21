import api from './api'

const notificationService = {
  // Get all notifications
  async getNotifications(unreadOnly = false) {
    const params = unreadOnly ? '?unread_only=true' : ''
    const response = await api.get(`/notifications${params}`)
    return response.data
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data.count
  },

  // Mark as read
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read')
    return response.data
  },

  // Delete notification
  async deleteNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}`)
  }
}

export default notificationService
