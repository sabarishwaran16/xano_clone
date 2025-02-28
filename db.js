const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DATABASE_USER_NAME,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Function to execute SQL queries safely
const query = async (workspace, sql, params = []) => {
  if (!sql || typeof sql !== "string") {
    throw new Error("Invalid SQL query provided");
  }
  if (!workspace || typeof workspace !== "string") {
    throw new Error("Invalid workspace name provided");
  }

  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query(`SET search_path TO ${workspace};`); // Set schema
    const result = await client.query(sql, params); // Execute query
    return result;
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Ensure the database connection works (Fixed)
pool.connect()
  .then(client => {
    console.log("Connected to PostgreSQL");
    client.release(); // Release the initial client
  })
  .catch(err => console.error("Error connecting to PostgreSQL:", err));

module.exports = { query, pool };
