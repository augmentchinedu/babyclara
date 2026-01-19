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

import { userResolver } from "./graphql/resolver/user.resolver.js"; // ✅ new
import { typeDefs } from "./graphql/service/tguService.js"; // ✅ typeDefs for TGU

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
const { name: workstationName, framework, projects = [] } = config;

console.log(
  `🧠 Workstation: ${workstationName} | Framework: ${framework || "vanilla"}`
);

const app = express();
const PORT = process.env.BABYCLARA_GUI_PORT || 5178;
const publicDir = path.join(__dirname, "client");

// Serve SPA
app.use(express.static(publicDir, { maxAge: "1d", index: false }));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
app.get("/*splat", (req, res) =>
  res.sendFile(path.join(publicDir, "index.html"))
);

// -----------------------------
// GraphQL Schema & Resolvers
// -----------------------------
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Mutation: { ...userResolver.Mutation }, // spread user resolvers
  },
});

// -----------------------------
// GraphQL WebSocket Server
// -----------------------------
const httpServer = http.createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
useServer({ schema }, wsServer);

// -----------------------------
// Apollo Logging Plugin
// -----------------------------
const gqlLoggerPlugin = {
  async requestDidStart(requestContext) {
    const { request } = requestContext;
    console.group("🧠 GraphQL Request");
    console.log("Operation:", request.operationName);
    console.log("Query:", request.query);
    console.log("Variables:", request.variables);
    console.groupEnd();

    return {
      async didEncounterErrors(ctx) {
        console.error("❌ GraphQL Errors:", ctx.errors);
      },
    };
  },
};

// -----------------------------
// Apollo Server
// -----------------------------
const apolloServer = new ApolloServer({ schema, plugins: [gqlLoggerPlugin] });
await apolloServer.start();
app.use("/graphql", express.json(), expressMiddleware(apolloServer));

// -----------------------------
// Start File Watcher
// -----------------------------
startFileWatcher(pubsub, path.resolve(rootDir, "code"));

console.log("🚀 BabyClara ready");
httpServer.listen(PORT, () => {
  console.log(`🚀 GUI running at http://localhost:${PORT}`);
});
await open(url);
