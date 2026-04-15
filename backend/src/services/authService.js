const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");
const HttpError = require("../utils/httpError");
const { signToken } = require("../utils/jwt");

const validRoles = ["PROFESSOR", "COORDINATOR", "DIRECTOR"];

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const register = async ({ name, email, password, role }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new HttpError(409, "email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    },
  });

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new HttpError(401, "invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "invalid credentials");
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
};

module.exports = {
  register,
  login,
};
