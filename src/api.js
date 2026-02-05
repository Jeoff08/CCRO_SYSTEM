const API_BASE_URL = "http://localhost:3001/api";

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Boxes API
export const boxesAPI = {
  getAll: () => apiRequest("/boxes"),
  getById: (id) => apiRequest(`/boxes/${id}`),
  create: (box) => apiRequest("/boxes", { method: "POST", body: box }),
  update: (id, box) => apiRequest(`/boxes/${id}`, { method: "PUT", body: box }),
  delete: (id) => apiRequest(`/boxes/${id}`, { method: "DELETE" }),
};

// Location Profiles API
export const locationProfilesAPI = {
  getAll: () => apiRequest("/location-profiles"),
  getActive: () => apiRequest("/location-profiles/active"),
  getById: (id) => apiRequest(`/location-profiles/${id}`),
  createOrUpdate: (profile) =>
    apiRequest("/location-profiles", { method: "POST", body: profile }),
  setActive: (id) =>
    apiRequest(`/location-profiles/${id}/active`, { method: "PUT" }),
  delete: (id) =>
    apiRequest(`/location-profiles/${id}`, { method: "DELETE" }),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (limit = 100) =>
    apiRequest(`/activity-logs?limit=${limit}`),
  create: (log) =>
    apiRequest("/activity-logs", { method: "POST", body: log }),
  getByUser: (userId, limit = 100) =>
    apiRequest(`/activity-logs/user/${userId}?limit=${limit}`),
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    }),
  getUser: (id) => apiRequest(`/auth/user/${id}`),
};

