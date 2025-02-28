const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const routes = [
  { path: "/api/users", module: "./routes/users.js" },
  { path: "/api/workspace", module: "./routes/workspace" },
]

routes.forEach((route) => {
  try {
    app.use(route.path, require(route.module));
  } catch (error) {
    console.error(`Error loading route ${route.path}:`, error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
