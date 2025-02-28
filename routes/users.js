const express = require("express");
const router = express.Router();

const { pool } = require("../db");


router.post("/register", async (req, res) => {
    const { username, email, password, workspace } = req.body;
    if (!username || !email || !password || !workspace) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      await pool.query("BEGIN");
  
      const insertUserQuery = `
        INSERT INTO public.users (username, email, password, workspace_name) 
        VALUES ($1, $2, $3, $4) RETURNING id;
      `;
      const userResult = await pool.query(insertUserQuery, [username, email, password, workspace]);
      const userId = userResult.rows[0].id;
  
      const createWorkspaceQuery = `SELECT create_user_workspace($1, $2)`;
      await pool.query(createWorkspaceQuery, [userId, workspace]);
  
      await pool.query("COMMIT");
      res.json({ success: true, message: "User registered and workspace created!" });
    } catch (error) {
      await pool.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    } 
  });
  
  router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT id, username, email, workspace_name FROM public.users");
      res.json({ success: true, users: result.rows });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT id, username, email, workspace_name FROM public.users WHERE id = $1", [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


module.exports = router;