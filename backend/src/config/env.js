require("dotenv").config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
const port = Number(process.env.PORT) || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "";

let parsedDatabaseUrl;

try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch (_error) {
  throw new Error("DATABASE_URL must be a valid URL");
}

if (!["postgresql:", "postgres:"].includes(parsedDatabaseUrl.protocol)) {
  throw new Error("DATABASE_URL must use the PostgreSQL protocol");
}

if (!jwtSecret || jwtSecret.trim().length < 10) {
  throw new Error("JWT_SECRET must be defined and contain at least 10 characters");
}

module.exports = {
  jwtSecret,
  databaseUrl,
  port,
  corsOrigins: corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
