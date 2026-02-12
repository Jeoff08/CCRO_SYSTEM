/**
 * Express error-handling middleware.
 * Catches any unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
}
