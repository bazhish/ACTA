const express = require("express");

const authController = require("../controllers/authController");
const { validateBody } = require("../middleware/validate");
const { loginSchema, registerSchema } = require("../validation/authSchemas");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", validateBody(loginSchema), asyncHandler(authController.login));

module.exports = router;
