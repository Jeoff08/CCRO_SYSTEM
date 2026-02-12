import { apiRequest } from "./client.js";

export const authAPI = {
  login: (username, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    }),
  getUser: (id) => apiRequest(`/auth/user/${id}`),
};
