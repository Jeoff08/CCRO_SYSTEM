import { apiRequest } from "./client.js";

export const activityLogsAPI = {
  getAll: (limit = 100) => apiRequest(`/activity-logs?limit=${limit}`),
  create: (log) => apiRequest("/activity-logs", { method: "POST", body: log }),
  getByUser: (userId, limit = 100) =>
    apiRequest(`/activity-logs/user/${userId}?limit=${limit}`),
  clearAll: () => apiRequest("/activity-logs", { method: "DELETE" }),
};
