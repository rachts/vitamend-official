const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
});

module.exports = {
  forgotPasswordLimiter,
};
