const express = require("express");
const router = express.Router()
const { query } = require("../db");


router.post("/:workspace/users", async (req, res) => {
    const { workspace } = req.params; 
    const { name, email } = req.body;
  
    try {
      const result = await query(
        workspace,
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [name, email]
      );
      res.json({ success: true, user: result[0] });
    } catch (error) {
      res.status(500).json({ error: "Database Error" });
    }
  });
  
  // API to fetch users from a specific workspace
  router.get("/:workspace/users", async (req, res) => {
    const { workspace } = req.params;
  
    try {
      const users = await query(workspace, "SELECT * FROM users");
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ error: "Database Error" });
    }
  });
  
  // 🛠️ Create a Table with Foreign Keys & Constraints
  router.post("/:workspace/create-table", async (req, res) => {
    const { workspace } = req.params;
    const { tableName, columns, foreignKeys } = req.body;
  
    if (!tableName || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: "Invalid request format" });
    }
  
    // 📌 Generate Column Definitions
    const columnDefinitions = columns
      .map((col) => {
        let colDef = `${col.name} ${col.type}`;
  
        if (col.isPrimary) colDef += " PRIMARY KEY";
        if (col.isUnique) colDef += " UNIQUE";
        if (col.notNull) colDef += " NOT NULL";
        if (col.defaultValue) colDef += ` DEFAULT ${col.defaultValue}`;
        if (col.check) colDef += ` CHECK (${col.name} ${col.check})`;
  
        return colDef;
      })
      .join(", ");
  
    // 📌 Generate Foreign Keys
    const foreignKeyDefinitions = foreignKeys
      ? foreignKeys
          .map(
            (fk) =>
              `FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencesTable}(${fk.referencesColumn}) ON DELETE ${fk.onDelete}`
          )
          .join(", ")
      : "";
  
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions}${
      foreignKeyDefinitions ? ", " + foreignKeyDefinitions : ""
    })`;
  
    try {
      await query(workspace, sql);
      res.json({
        success: true,
        message: `Table '${tableName}' created successfully in workspace '${workspace}'`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating table" });
    }
  });
  
  
  // 🛠️ Create a PostgreSQL Function
  router.post("/:workspace/create-function", async (req, res) => {
    const { workspace } = req.params;
    const { functionName, functionBody, returnType, params } = req.body;
  
    if (!functionName || !functionBody || !returnType) {
      return res.status(400).json({ error: "Invalid function format" });
    }
  
    const paramDefinitions = params
      ? params.map((param) => `${param.name} ${param.type}`).join(", ")
      : "";
  
    const sql = `
      CREATE OR REPLACE FUNCTION ${functionName}(${paramDefinitions})
      RETURNS ${returnType} AS $$
      ${functionBody}
      $$ LANGUAGE plpgsql;
    `;
  
    try {
      await query(workspace, sql);
      res.json({
        success: true,
        message: `Function '${functionName}' created successfully in workspace '${workspace}'`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating function" });
    }
  });
  
  router.post("/:workspace/:table/insert", async (req, res) => {
    const { workspace, table } = req.params;
    const data = req.body; // Data to insert (should be a JSON object)
  
    if (!table || !data || typeof data !== "object" || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Invalid request format" });
    }
  
    const columns = Object.keys(data);
    const values = Object.values(data);
  
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
  
    try {
      const result = await query(workspace, sql, values);
      res.json({ success: true, message: "Data inserted successfully", data: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error inserting data" });
    }
  });
  

module.exports = router;