const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config/env");

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "1d" }
  );

module.exports = {
  signToken,
};
