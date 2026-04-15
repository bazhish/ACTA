require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const { port } = require("./config/env");

const server = app.listen(port, () => {
  console.log(`ACTA backend running on port ${port}`);
});

const shutdown = async (signal) => {
  console.log(`[SERVER] Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (error) => {
  console.error("[SERVER] Unhandled rejection", error);
});
process.on("uncaughtException", (error) => {
  console.error("[SERVER] Uncaught exception", error);
});
