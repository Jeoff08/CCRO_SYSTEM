import { apiRequest } from "./client.js";

export const checkoutsAPI = {
  /** Get all active checkouts (not returned). Use ?active=false for all. */
  getAll: (active = true) =>
    apiRequest(`/checkouts${active === false ? "?active=false" : ""}`),
  /** Get active checkouts for one personnel ID */
  getByPersonnelId: (personnelId) =>
    apiRequest(`/checkouts/by-personnel/${encodeURIComponent(personnelId)}`),
  create: (data) =>
    apiRequest("/checkouts", { method: "POST", body: data }),
  markReturned: (id) =>
    apiRequest(`/checkouts/${id}/return`, { method: "PATCH" }),
};
