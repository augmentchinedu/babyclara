const path = require("path");
const { spawn } = require("child_process");


// Root folder containing apps/ and games/
const rootDir = process.cwd();

// Helper: run a command
function runCommand(cmd, cwd, env = {}) {
  const [command, ...args] = cmd.split(" ");
  const proc = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env },
  });

  return new Promise((resolve, reject) => {
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Command failed: ${cmd}`))
    );
  });
}

const init = async () => {
  const finalProjects = [
    ...apps.map((app) => ({
      name: app,
      path: path.join(rootDir, "apps", app),
    })),
    ...games.map((game) => ({
      name: game,
      path: path.join(rootDir, "games", game),
    })),
  ];

  if (finalProjects.length === 0) {
    console.log("❌ No apps or games found in /data.");
    return;
  }

  const basePort = 3000;

  const projectsWithPorts = finalProjects.map((proj, index) => ({
    ...proj,
    port: basePort + index,
  }));

  projectsWithPorts.forEach(({ name, port }) => {
    console.log(`✔ ${name} will run at http://localhost:${port}`);
  });

  console.log("\n[SETUP] Starting Vite servers...\n");

  await Promise.all(
    projectsWithPorts.map(({ path, port }) =>
      runCommand(`npx vite --port ${port}`, path)
    )
  );
};

module.exports = init;
