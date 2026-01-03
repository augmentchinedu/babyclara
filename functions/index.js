const fs = require("fs");
const path = require("path");

const wsRequest = require("../core/ws");

/**
 * Convert string to kebab-case
 */
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

/* ======================================================
   SAVE ROUTES TO BACKEND
====================================================== */
async function saveRoutes(type, project) {
  const pagesPath = path.join(
    process.cwd(),
    `${type}s`,
    project,
    "src",
    "pages"
  );

  if (!fs.existsSync(pagesPath)) return;

  const routes = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!file.endsWith(".vue")) continue;

      const relative = path
        .relative(pagesPath, fullPath)
        .replace(/\\/g, "/")
        .replace(".vue", "");

      const segments = relative.split("/").map(kebabCase);
      const name = segments[segments.length - 1];

      const routePath = "/" + segments.join("/");

      if (routePath === "/404") continue;

      routes.push({
        _id: routePath,
        name,
        component: `pages/${relative}.vue`,
        redirect: null,
        parent: segments.length > 1 ? segments[segments.length - 2] : null,
        meta: {},
        projects: [project],
      });
    }
  }

  walk(pagesPath);

  if (!routes.length) return;

  try {
    await wsRequest("/routes/saveBatch", { routes });
    console.log(`✓ Sent ${routes.length} routes for "${project}"`);
  } catch (err) {
    console.error("Route sync failed:", err.message);
  }
}

/* ======================================================
   FRONTEND ROUTER GENERATION
====================================================== */

/**
 * Collect all Vue files
 */
function getVueFiles(pagesPath) {
  const files = [];

  function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".vue")) {
        files.push(fullPath);
      }
    });
  }

  walk(pagesPath);
  return files;
}

/**
 * Generate Vue Router routes
 */
function generateRoutes(files, pagesPath) {
  return files.map((fullPath) => {
    const relative = path
      .relative(pagesPath, fullPath)
      .replace(/\\/g, "/")
      .replace(".vue", "");

    const segments = relative.split("/").map(kebabCase);
    const name = segments[segments.length - 1];

    const routePath =
      "/" + segments.join("/");

    return {
      path: routePath === "/home" ? "/" : routePath,
      name,
      component: `() => import('@/pages/${relative}.vue')`,
    };
  });
}

/**
 * Write src/router/index.js
 */
function writeRouterFile(routes, routerPath) {
  const content = `import { createRouter, createWebHistory } from 'vue-router';

const routes = [
${routes
      .map(
        (r) => `  {
    path: '${r.path}',
    name: '${r.name}',
    component: ${r.component}
  }`
      )
      .join(",\n")}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
`;

  fs.mkdirSync(path.dirname(routerPath), { recursive: true });
  fs.writeFileSync(routerPath, content, "utf8");

  // console.log("✓ Vue router generated");
}

/* ======================================================
   MAIN ENTRY
====================================================== */
function createRouter(type, project) {
  const basePath = path.join(
    process.cwd(),
    `${type}s`,
    project,
    "src"
  );

  const pagesPath = path.join(basePath, "pages");
  const routerPath = path.join(basePath, "router", "index.js");

  if (!fs.existsSync(pagesPath)) return;

  const vueFiles = getVueFiles(pagesPath);
  const routes = generateRoutes(vueFiles, pagesPath);

  writeRouterFile(routes, routerPath);
}





/**
 * Dynamic Pinia Store Generator
 * ---------------------------------
 * - Scans pages & components
 * - Detects store usage
 * - Fetches store logic from DB via WS
 * - Generates src/store/index.js
 * - Hot reloads clients
 */


/* ----------------------------------
 * 1. Extract store usage
 * ---------------------------------- */

function extractStoreUsage(content) {
  const found = new Set();

  // store.login()
  const direct = /\bstore\.([a-zA-Z_$][\w$]*)\s*\(/g;

  // const { login, logout } = store
  const destructured = /\{\s*([^}]+)\s*\}\s*=\s*store/g;

  let match;

  while ((match = direct.exec(content))) {
    found.add(match[1]);
  }

  while ((match = destructured.exec(content))) {
    match[1]
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(fn => found.add(fn));
  }

  console.log(found)
  return [...found];
}

/* ----------------------------------
 * 2. Recursively scan directories
 * ---------------------------------- */

function scanDir(dir, bucket = new Set()) {
  if (!fs.existsSync(dir)) return bucket;

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath, bucket);
    } else if (/\.(vue|js)$/.test(entry)) {
      const content = fs.readFileSync(fullPath, "utf8");
      extractStoreUsage(content).forEach(fn => bucket.add(fn));
    }
  }

  return bucket;
}

/* ----------------------------------
 * 3. Fetch store definitions from DB
 * ---------------------------------- */
/**
 * Expected DB response:
 * [
 *   {
 *     name: "login",
 *     type: "action" | "getter",
 *     body: "async login(payload) { ... }",
 *     state: { user: null },
 *     imports: ["axios"]
 *   }
 * ]
 */

async function fetchStoreDefinitions(functions) {
  if (!functions.length) return [];

  return wsRequest("getStoreDefinition", {
    functions
  });
}

/* ----------------------------------
 * 4. Build imports
 * ---------------------------------- */

function buildImports(defs) {
  const imports = new Set();

  defs.forEach(d => {
    (d.imports || []).forEach(i => imports.add(i));
  });

  return [...imports]
    .map(i => `import ${i} from "${i}";`)
    .join("\n");
}

/* ----------------------------------
 * 5. Infer state
 * ---------------------------------- */

function buildState(defs) {
  const state = {};

  defs.forEach(d => {
    if (d.state && typeof d.state === "object") {
      Object.assign(state, d.state);
    }
  });

  return JSON.stringify(state, null, 2);
}

/* ----------------------------------
 * 6. Split getters & actions
 * ---------------------------------- */

function splitDefs(defs) {
  return {
    actions: defs.filter(d => d.type === "action"),
    getters: defs.filter(d => d.type === "getter")
  };
}

/* ----------------------------------
 * 7. Generate Pinia store
 * ---------------------------------- */

function generateStore(defs) {
  const imports = buildImports(defs);
  const state = buildState(defs);
  const { actions, getters } = splitDefs(defs);

  return `
import { defineStore } from "pinia";
${imports}

export const useStore = defineStore("store", {
  state: () => (${state}),

  getters: {
${getters.map(g => "    " + g.body).join(",\n")}
  },

  actions: {
${actions.map(a => "    " + a.body).join(",\n")}
  }
});
`.trim();
}

/* ----------------------------------
 * 8. Hot reload notifier
 * ---------------------------------- */

function notifyClients(project) {
  wsRequest("hotReload", {
    project,
    target: "store"
  });
}

/* ----------------------------------
 * 9. MAIN createStore FUNCTION
 * ---------------------------------- */

async function createStore(type, project) {
  const root = path.join(process.cwd(), `${type}s`, project, "src");

  const pagesDir = path.join(root, "pages");
  const componentsDir = path.join(root, "components");
  const storeDir = path.join(root, "store");

  // 1. Scan usage
  const used = new Set();
  scanDir(pagesDir, used);
  scanDir(componentsDir, used);

  if (!used.size) {
    console.log("ℹ No store usage found");
    return;
  }

  console.log("🔍 Store functions found:", [...used]);

  // 2. Fetch definitions
  const defs = await fetchStoreDefinitions([...used]);

  if (!defs.length) {
    console.log("⚠ No store definitions returned from DB");
    return;
  }

  // 3. Generate store
  const storeCode = generateStore(defs);

  fs.mkdirSync(storeDir, { recursive: true });
  fs.writeFileSync(
    path.join(storeDir, "index.js"),
    storeCode,
    "utf8"
  );

  // 4. Hot reload
  notifyClients(project);

  console.log("✅ Pinia store generated successfully");
}

/* ----------------------------------
 * EXPORT
 * ---------------------------------- */


module.exports = {
  saveRoutes,
  createRouter,
  createStore
};
