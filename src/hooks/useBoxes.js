import { useState, useCallback } from "react";
import { boxesAPI } from "../api/index.js";

/**
 * Hook that manages box CRUD state and API interaction.
 */
export function useBoxes(initialBoxes = []) {
  const [boxes, setBoxes] = useState(initialBoxes);

  const loadBoxes = useCallback(async () => {
    try {
      const data = await boxesAPI.getAll();
      setBoxes(data);
      return data;
    } catch (error) {
      console.error("Failed to load boxes:", error);
      return [];
    }
  }, []);

  const addBox = useCallback(async (box) => {
    const newBox = await boxesAPI.create(box);
    setBoxes((prev) => [...prev, newBox]);
    return newBox;
  }, []);

  const updateBox = useCallback(async (updated) => {
    const updatedBox = await boxesAPI.update(updated.id, updated);
    setBoxes((prev) =>
      prev.map((b) => (b.id === updated.id ? updatedBox : b))
    );
    return updatedBox;
  }, []);

  const deleteBox = useCallback(async (id) => {
    await boxesAPI.delete(id);
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { boxes, setBoxes, loadBoxes, addBox, updateBox, deleteBox };
}
