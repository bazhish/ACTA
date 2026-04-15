const express = require("express");
const cors = require("cors");

const { corsOrigins } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const occurrenceRoutes = require("./routes/occurrenceRoutes");
const HttpError = require("./utils/httpError");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const { sendSuccess } = require("./utils/response");

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new HttpError(403, "origin not allowed by CORS"));
    },
  })
);
app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/occurrences", occurrenceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
