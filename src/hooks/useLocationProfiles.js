import { useState, useCallback, useMemo } from "react";
import { locationProfilesAPI } from "../api/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../constants/index.js";

/**
 * Hook that manages location profiles state and API interaction.
 */
export function useLocationProfiles() {
  const [locationProfiles, setLocationProfiles] = useState([]);
  const [activeLocationProfileId, setActiveLocationProfileId] = useState("");

  const loadProfiles = useCallback(async () => {
    try {
      const data = await locationProfilesAPI.getAll();

      const profiles =
        data.length > 0
          ? data
          : [
              {
                id: crypto.randomUUID(),
                name: "Default mapping",
                shelfLettersByBay: DEFAULT_SHELF_LETTERS_BY_BAY,
                rowLabels: DEFAULT_ROW_LABELS,
                updatedAt: new Date().toISOString(),
              },
            ];

      setLocationProfiles(profiles);

      // Set active profile
      const activeProfile = data.find((p) => p.isActive) || data[0];
      if (activeProfile) {
        setActiveLocationProfileId(activeProfile.id);
      }

      return profiles;
    } catch (error) {
      console.error("Failed to load profiles:", error);
      return [];
    }
  }, []);

  const activeLocationProfile = useMemo(
    () =>
      locationProfiles.find((p) => p.id === activeLocationProfileId) ||
      locationProfiles[0],
    [locationProfiles, activeLocationProfileId]
  );

  const setActiveProfile = useCallback(
    async (id) => {
      try {
        await locationProfilesAPI.setActive(id);
        setActiveLocationProfileId(id);
        await loadProfiles();
      } catch (error) {
        console.error("Failed to set active profile:", error);
      }
    },
    [loadProfiles]
  );

  const upsertProfile = useCallback(
    async (profile) => {
      await locationProfilesAPI.createOrUpdate(profile);
      await loadProfiles();
    },
    [loadProfiles]
  );

  const deleteProfile = useCallback(
    async (id) => {
      await locationProfilesAPI.delete(id);
      const remaining = locationProfiles.filter((p) => p.id !== id);
      if (activeLocationProfileId === id && remaining.length) {
        setActiveLocationProfileId(remaining[0].id);
      }
      await loadProfiles();
    },
    [locationProfiles, activeLocationProfileId, loadProfiles]
  );

  return {
    locationProfiles,
    activeLocationProfileId,
    activeLocationProfile,
    setActiveLocationProfileId,
    loadProfiles,
    setActiveProfile,
    upsertProfile,
    deleteProfile,
  };
}
