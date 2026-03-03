import { apiRequest } from "./client.js";

export const personnelAPI = {
  getAll: () => apiRequest("/personnel"),
  getByPersonnelId: (personnelId) =>
    apiRequest(`/personnel/by-id/${encodeURIComponent(personnelId)}`),
  create: (data) =>
    apiRequest("/personnel", { method: "POST", body: data }),
  delete: (id) =>
    apiRequest(`/personnel/${id}`, { method: "DELETE" }),
};
