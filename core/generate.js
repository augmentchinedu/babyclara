const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const targetDir = process.cwd();

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function installDeps(projectPath) {
  return new Promise((resolve, reject) => {
    const npm = spawn("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });

    npm.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("npm install failed"));
    });
  });
}

async function generate() {
  console.log("\nWelcome to BabyClara ✨\n");

  // Step 0 — CLI init
  const defaultName = path.basename(targetDir) || "babyclara-workstation";
  const nameInput = await ask(`Workstation name (default: ${defaultName}): `);
  const name = nameInput || defaultName;

  console.log("\nChoose framework:");
  console.log("1) Vanilla (none)");
  console.log("2) React");
  console.log("3) Vue");

  const frameworkInput = await ask("Select (1-3) [1]: ");

  let framework = null;
  if (frameworkInput === "2") framework = "react";
  if (frameworkInput === "3") framework = "vue";

  // package.json
  const pkgPath = path.join(targetDir, "package.json");

  const pkg = {
    name,
    private: true,
    scripts: {
      start: "node ./node_modules/babyclara/core/index.js",
    },
    dependencies: {
      babyclara: "latest", // always install itself locally
    },
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✔ package.json created");

  // babyclara.config.js
  const configPath = path.join(targetDir, "babyclara.config.js");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `module.exports = {
  name: "${name}",
  framework: ${framework ? `"${framework}"` : null},
};
`
    );
    console.log("✔ babyclara.config.js created");
  }

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  await installDeps(targetDir);

  console.log("\n✅ BabyClara workstation ready.");
  console.log("➡ Run: npm start\n");
}

module.exports = generate;
