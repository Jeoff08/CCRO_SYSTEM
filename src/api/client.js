const API_BASE_URL = "http://localhost:3001/api";

/**
 * Thin wrapper around fetch() that handles JSON serialization,
 * error responses, and 204 (No Content).
 */
export async function apiRequest(endpoint, options = {}) {
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

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (text.trimStart().startsWith("<!") || text.trimStart().startsWith("<")) {
        throw new Error(
          "Server returned HTML instead of JSON. Is the API server running at " +
            API_BASE_URL.replace(/\/api\/?$/, "") +
            "? Start it (e.g. node server/index.js) and try again."
        );
      }
      throw new Error(
        "Server returned non-JSON (Content-Type: " + contentType + "). Status: " + response.status
      );
    }

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

/**
 * Fetch Box management export as a .db file (blob). Caller should trigger download.
 */
export async function fetchBoxManagementExportDb() {
  const response = await fetch(`${API_BASE_URL}/boxes/export-db`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Export failed: ${response.status}`);
  }
  return response.blob();
}
