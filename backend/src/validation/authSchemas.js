const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "name must contain at least 2 characters"),
  email: z.string().trim().email("email must be valid"),
  password: z.string().min(6, "password must contain at least 6 characters"),
  role: z.enum(["PROFESSOR", "COORDINATOR", "DIRECTOR"]),
});

const loginSchema = z.object({
  email: z.string().trim().email("email must be valid"),
  password: z.string().min(1, "password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
