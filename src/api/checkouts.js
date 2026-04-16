import { apiRequest } from "./client.js";

export const checkoutsAPI = {
  /** Get all active checkouts (not returned). Use ?active=false for all. */
  getAll: (active = true) =>
    apiRequest(`/checkouts${active === false ? "?active=false" : ""}`),
  /** Get active checkouts for one personnel ID. Use pendingReturnOnly: true for only pending returns. */
  getByPersonnelId: (personnelId, { pendingReturnOnly = false } = {}) =>
    apiRequest(
      `/checkouts/by-personnel/${encodeURIComponent(personnelId)}${pendingReturnOnly ? "?pendingReturn=true" : ""}`
    ),
  create: (data) =>
    apiRequest("/checkouts", { method: "POST", body: data }),
  markReturned: (id) =>
    apiRequest(`/checkouts/${id}/return`, { method: "PATCH" }),
  /** Personnel submits a return (pending); admin confirms in Personnel Management. */
  submitReturn: (id) =>
    apiRequest(`/checkouts/${id}/submit-return`, { method: "PATCH" }),
};
