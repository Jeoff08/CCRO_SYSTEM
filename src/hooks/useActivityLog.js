import { useState, useEffect, useCallback } from "react";
import { activityLogsAPI } from "../api/index.js";

/**
 * Hook that manages activity log state and API interaction.
 * @param {Object|null} user - currently logged-in user (for log attribution)
 */
export function useActivityLog(user) {
  const [activityLog, setActivityLog] = useState([]);

  const loadActivityLogs = useCallback(async () => {
    try {
      const logs = await activityLogsAPI.getAll(100);
      setActivityLog(logs);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    }
  }, []);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  const addLog = useCallback(
    async (type, details, searchCode = null) => {
      try {
        const logData = {
          userId: user?.id || null,
          username: user?.username || null,
          type,
          details: typeof details === "string" ? details : details,
          searchCode,
        };

        const newLog = await activityLogsAPI.create(logData);
        setActivityLog((prev) => [newLog, ...prev]);
      } catch (error) {
        console.error("Failed to create activity log:", error);
        // Fallback to local state if API fails
        setActivityLog((prev) => [
          {
            id: crypto.randomUUID(),
            type,
            details,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    },
    [user]
  );

  const clearHistory = useCallback(async () => {
    try {
      await activityLogsAPI.clearAll();
      setActivityLog([]);
    } catch (error) {
      console.error("Failed to clear activity logs:", error);
    }
  }, []);

  return { activityLog, addLog, clearHistory };
}
