import { Hono } from "hono";
import { config } from "dotenv";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cors } from "hono/cors";

import { appRouter } from "@/trpc/router";
import { createContext } from "@/trpc/context";

// Load environment variables
config();

// Create Hono app
const app = new Hono();

// Use CORS middleware
app.use("*", cors());

// tRPC handler using fetch adapter
app.use("/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });

  return response;
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Bun server
export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  fetch: app.fetch,
};
