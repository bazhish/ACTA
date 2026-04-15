const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");

const HttpError = require("../utils/httpError");

const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "route not found"));
};

const normalizeError = (error) => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: "validation error",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      statusCode: 400,
      message: "database error",
      details: error.message,
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: "database validation error",
      details: error.message,
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || "internal server error",
    details: error.details,
  };
};

const errorHandler = (error, req, res, _next) => {
  const normalizedError = normalizeError(error);

  console.error("[ERROR]", {
    method: req.method,
    path: req.originalUrl,
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    details: normalizedError.details,
  });

  res.status(normalizedError.statusCode).json({
    success: false,
    error: {
      message: normalizedError.message,
      statusCode: normalizedError.statusCode,
      details: normalizedError.details || null,
    },
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
