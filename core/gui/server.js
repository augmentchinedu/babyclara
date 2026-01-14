const express = require("express");
const path = require("path");

async function startGUI() {
  const app = express();
  const PORT = process.env.BABYCLARA_GUI_PORT || 5178;

  app.use(express.json());

  const publicDir = path.join(__dirname, "dist");
  app.use(express.static(publicDir));

  // Serve index.html on the root
  app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  // Catch‑all for SPA routing (Express 5 syntax)
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`🖥 GUI running at http://localhost:${PORT}`);
      resolve();
    });
  });
}

module.exports = startGUI;
