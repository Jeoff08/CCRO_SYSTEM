import { apiRequest, fetchBoxManagementExportDb } from "./client.js";

export const boxesAPI = {
  getAll: () => apiRequest("/boxes"),
  getById: (id) => apiRequest(`/boxes/${id}`),
  create: (box) => apiRequest("/boxes", { method: "POST", body: box }),
  update: (id, box) => apiRequest(`/boxes/${id}`, { method: "PUT", body: box }),
  delete: (id) => apiRequest(`/boxes/${id}`, { method: "DELETE" }),
  /** Export Box management only as .db blob. Returns Blob; caller triggers download. */
  exportDb: fetchBoxManagementExportDb,
  /** Import Box management from .db file. body: base64 string of file. */
  importDb: (base64) => apiRequest("/boxes/import-db", { method: "POST", body: { data: base64 } }),
};
