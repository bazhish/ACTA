const HttpError = require("../utils/httpError");

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new HttpError(401, "authentication is required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, "user does not have permission"));
  }

  next();
};

module.exports = authorizeRoles;
