const path = require("path");

const rootDir = process.cwd();
const configPath = path.join(rootDir, "babyclara.config.js");

function getWorkstation() {
  delete require.cache[require.resolve(configPath)];

  const config = require(configPath);
  const { name, framework } = config;

  return { name, framework };
}

module.exports = {
  getWorkstation,
};
