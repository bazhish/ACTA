const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

const register = async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 201);
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result);
};

module.exports = {
  register,
  login,
};
