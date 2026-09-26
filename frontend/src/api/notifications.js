import apiClient from "./apiClient";


export async function fetchNotifications(userId) {
  const response = await apiClient.get(
    "/notifications/",
    {
      params: {
        user_id: userId,
      },
    }
  );

  return response.data;
}


export async function markNotificationRead(
  notificationId
) {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read/`
  );

  return response.data;
}


export async function markAllNotificationsRead(
  userId
) {
  const response = await apiClient.patch(
    "/notifications/read-all/",
    {
      user_id: userId,
    }
  );

  return response.data;
}


export async function fetchStats() {
  const response = await apiClient.get(
    "/notifications/stats/"
  );

  return response.data;
}