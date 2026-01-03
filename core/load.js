const fs = require("fs");
const path = require("path");

const wsRequest = require("./ws");
const { createStore, createRouter, saveRoutes } = require("../functions");

const load = async (project, type) => {
  console.log(`Loading ${type} project: ${project}`);

  try {
    if (!["app", "game"].includes(type)) {
      throw new Error(`Invalid project type: ${type}`);
    }

    const projectFolder = path.join(process.cwd(), `${type}s`, project);
    const projectSrcFolder = path.join(projectFolder, "src");

    fs.mkdirSync(projectSrcFolder, { recursive: true });

    // 1️⃣ Fetch global files for THIS type (app | game)
    const globalFiles = await wsRequest("getGlobalFiles", {
      type, // 👈 important
    });

    for (const file of globalFiles.data) {
      const { fileName, data } = file;
      const targetPath = path.join(projectFolder, fileName);
      const targetDir = path.dirname(targetPath);

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, data);
    }

    // 2️⃣ Fetch project-specific files
    const projectFiles = await wsRequest("getProjectFiles", {
      project,
      type,
    });

    for (const file of projectFiles.data) {
      const { fileName, data } = file;
      const targetPath = path.join(projectSrcFolder, fileName);
      const targetDir = path.dirname(targetPath);

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, data);
    }

    await saveRoutes(type, project);
    await createRouter(type, project);
    await createStore(type, project);

    console.log(`✅ ${type} project loaded successfully`);
  } catch (err) {
    console.error("❌ Failed to load files:", err);
  }
};

module.exports = load;
