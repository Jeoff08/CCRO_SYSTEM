import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Login
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = db
      .prepare(
        "SELECT id, username, role FROM users WHERE username = ? AND password = ?"
      )
      .get(username, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/user/:id", (req, res) => {
  try {
    const user = db
      .prepare("SELECT id, username, role FROM users WHERE id = ?")
      .get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
