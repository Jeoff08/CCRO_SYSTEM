import { apiRequest } from "./client.js";

export const boxesAPI = {
  getAll: () => apiRequest("/boxes"),
  getById: (id) => apiRequest(`/boxes/${id}`),
  create: (box) => apiRequest("/boxes", { method: "POST", body: box }),
  update: (id, box) => apiRequest(`/boxes/${id}`, { method: "PUT", body: box }),
  delete: (id) => apiRequest(`/boxes/${id}`, { method: "DELETE" }),
};
