import { apiRequest } from "./client.js";

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
