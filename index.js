#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Folders in your npm package to copy
// key = folder in CLI package
// value = destination folder name inside user's project
const foldersToCopy = [
  { from: "template", to: "." }, // copy into root
  { from: "data", to: "data" }   // copy into ./data
];

// Target folder (user directory)
const targetDir = process.cwd();

// Reusable recursive copy function
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

// Copy template and data folders
foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, folder.from);
  const dest = path.join(targetDir, folder.to);
  copyFolder(src, dest);
});

// Install gkrane inside the generated workspace
console.log("Installing Dependencies...");
execSync("npm install gkrane", { cwd: targetDir, stdio: "inherit" });

console.log("Done!");
