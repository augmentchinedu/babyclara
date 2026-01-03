const path = require("path");

const load = require("./load");
const serve = require("./serve");

// Dynamically load data/index.js from project root
const dataPath = path.join(process.cwd(), "data", "index.js");
const { apps = [], games = [] } = require(dataPath);

const init = async () => {
  console.log("Work Station Launched");

  // Step 1: Load all projects concurrently
  console.log("[SETUP] Loading all projects...");
  await Promise.all(apps.map((app) => load(app, "app")));
  await Promise.all(games.map((game) => load(game, "game")));

  // await serve();
};

init();
