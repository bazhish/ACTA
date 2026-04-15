const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config/env");
const HttpError = require("../utils/httpError");

const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "authorization token is required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (_error) {
    next(new HttpError(401, "invalid or expired token"));
  }
};

module.exports = authMiddleware;
