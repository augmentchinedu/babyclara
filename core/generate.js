const fs = require("fs");
const path = require("path");
const readline = require("readline");

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

async function generate() {
  console.log("\nWelcome to BabyClara ✨\n");

  // Step 0 — CLI initialization
  const defaultName = path.basename(targetDir) || "my-workstation";

  const nameInput = await ask(
    `Workstation name (default: ${defaultName}): `
  );

  const workstationName = nameInput || defaultName;

  console.log("\nChoose framework:");
  console.log("1) Vanilla (none)");
  console.log("2) React");
  console.log("3) Vue");

  const frameworkInput = await ask("Select (1-3) [1]: ");

  let framework = null;
  if (frameworkInput === "2") framework = "react";
  if (frameworkInput === "3") framework = "vue";

  // Ensure package.json
  const pkgPath = path.join(targetDir, "package.json");

  let pkg;
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } else {
    pkg = {
      name: workstationName,
      private: true,
      scripts: {},
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("\nCreated package.json");
  }

  // Add start script
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = "node ./node_modules/babyclara/core/index.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // Create babyclara.config.js
  const configPath = path.join(targetDir, "babyclara.config.js");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      `const projects = [];

module.exports = {
  workstationName: "${workstationName}",
  framework: ${framework ? `"${framework}"` : null},
  unocss: true,
  projects,
};
`
    );
    console.log("Created babyclara.config.js");
  } else {
    console.log("babyclara.config.js already exists — skipping");
  }

  console.log("\n✅ BabyClara workstation ready.\n");
}

module.exports = generate;
