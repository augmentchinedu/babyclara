#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const foldersToCopy = [
    { from: "template", to: "." },
    { from: "data", to: "data" }
];

const targetDir = process.cwd();

// Recursive folder copy
function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    if (items.length === 0) return;

    items.forEach(item => {
        const from = path.join(src, item);
        const to = path.join(dest, item);

        if (fs.lstatSync(from).isDirectory()) {
            copyFolder(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    });
}

console.log("Generating Work Station...");

// Copy folders
foldersToCopy.forEach(folder => {
    const src = path.join(__dirname, folder.from);
    const dest = path.join(targetDir, folder.to);
    copyFolder(src, dest);
});

// Install dependencies
console.log("Installing Dependencies...");
execSync("npm install gkrane ws cross-env --save", {
    cwd: targetDir,
    stdio: "inherit"
});

// Move local ./core into node_modules/babyclara/core
const localCore = path.join(targetDir, "core");
const babyclaraCore = path.join(
    targetDir,
    "node_modules",
    "babyclara",
    "core"
);

if (fs.existsSync(localCore)) {
    console.log("Moving ./core into node_modules/babyclara/core...");
    copyFolder(localCore, babyclaraCore);
    fs.rmSync(localCore, { recursive: true, force: true });
} else {
    console.log("No local ./core folder found, skipping move.");
}

// Delete template folder after setup
const templatePath = path.join(targetDir, "template");
if (fs.existsSync(templatePath)) {
    console.log("Removing template folder...");
    fs.rmSync(templatePath, { recursive: true, force: true });
}

// Modify package.json
const pkgPath = path.join(targetDir, "package.json");

if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    pkg.scripts = pkg.scripts || {};

    pkg.scripts.start =
        "node ./node_modules/babyclara/core/index.js";

    pkg.scripts.build =
        "cross-env BUILD=true node ./node_modules/babyclara/core/index.js";

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("Updated package.json scripts successfully.");
} else {
    console.warn("⚠️ No package.json found — cannot add scripts.");
}

console.log("Done!");
