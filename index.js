#!/usr/bin/env node
import { generateWorkStation } from "./core/generateWorkStation.js";
import { startFileWatcher } from "./core/fileWatcher.js";
import { pubsub } from "./graphql/resolver/file.resolver.js";

import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { typeDefs } from "./graphql/schema/index.js";
import { resolver as resolvers } from "./graphql/resolver/index.js";
import { loadTokens } from "./core/session/loadTokens.js";
import { bootstrapAfterAuth } from "./core/runtime/bootstrapAfterAuth.js";
import { loadWorkstation } from "./core/cache/loadWorkstation.js";
import { loadProjects } from "./core/cache/loadProjects.js";
import { updateRuntimeState } from "./core/runtime/state.js";

const open = (...args) => import("open").then((mod) => mod.default(...args));

console.log("\n🚀 Starting BabyClara Workstation...\n");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const configPath = path.join(rootDir, "babyclara.config.js");

if (!fs.existsSync(configPath)) {
  await generateWorkStation();
  process.exit(0);
}

const url = "http://localhost:5178/";

// ✅ ESM config import
const { default: config } = await import(pathToFileURL(configPath).href);
const { name: workstationName, framework, BABYCLARA_TGU_URL } = config;

// Load cached data into runtime state immediately for fast startup
const cachedWorkstation = loadWorkstation();
const cachedProjects = loadProjects();
if (cachedWorkstation?.data || cachedProjects?.data) {
  updateRuntimeState({
    workstation: cachedWorkstation?.data,
    projects: cachedProjects?.data,
  });
  console.log("📦 Loaded workstation and projects from cache");
}

if (!BABYCLARA_TGU_URL) {
  throw new Error(
    "❌ Configuration error: BABYCLARA_TGU_URL is missing in babyclara.config.js",
  );
}

// Validate TGU Reachability
try {
  const tguPing = await fetch(BABYCLARA_TGU_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ __typename }" }),
  });
  if (!tguPing.ok) throw new Error(`Status ${tguPing.status}`);
  console.log(`✅ TGU Connection verified at ${BABYCLARA_TGU_URL}`);
} catch (err) {
  throw new Error(
    `❌ TGU server unreachable at ${BABYCLARA_TGU_URL}: ${err.message}. Ensure TGU is running.`,
  );
}

console.log(
  `🧠 Workstation: ${workstationName} | Framework: ${framework || "vanilla"}`,
);

// Auto-bootstrap if session exists
const session = loadTokens();
if (session?.accessToken && session?.userId) {
  console.log("🔄 Re-authenticating session...");
  bootstrapAfterAuth(session.userId, session.accessToken).catch(() => {});
}

const app = express();
const PORT = process.env.BABYCLARA_GUI_PORT || 5178;
const publicDir = path.join(__dirname, "client");

// Serve SPA
app.use(express.static(publicDir, { maxAge: "1d", index: false }));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
app.get("/*splat", (req, res) =>
  res.sendFile(path.join(publicDir, "index.html")),
);

// -----------------------------
// GraphQL Schema & Resolvers
// -----------------------------
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// -----------------------------
// Starts HTTP Server
// -----------------------------
const httpServer = http.createServer(app);

// -----------------------------
// GraphQL WebSocket Server
// -----------------------------
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

useServer(
  {
    schema,
    context: (ctx) => {
      // Forward token from connectionParams or query
      let token =
        ctx.connectionParams?.token ||
        new URL(ctx.extra.request.url, "http://localhost").searchParams.get(
          "token",
        );

      // Fallback to persisted session
      if (!token) {
        token = loadTokens()?.accessToken;
      }

      return { token };
    },
  },
  wsServer,
);

// -----------------------------
// Apollo Server
// -----------------------------
const apolloServer = new ApolloServer({
  schema,
});
await apolloServer.start();

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const auth = req.headers.authorization || "";
      let token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

      // Fallback to persisted session
      if (!token) {
        token = loadTokens()?.accessToken;
      }

      return { token };
    },
  }),
);

// -----------------------------
// Start File Watcher
// -----------------------------
startFileWatcher(pubsub, path.resolve(rootDir, "code"));

console.log("🚀 BabyClara ready");
httpServer.listen(PORT, () => {
  console.log(`🚀 GUI running at http://localhost:${PORT}`);
});
await open(url);
