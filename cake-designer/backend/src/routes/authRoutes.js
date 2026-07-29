const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { authMiddleware } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

/**
 * POST /api/auth/signup
 * Validates input (name, email, password), hashes password, creates user, returns token and sanitized user
 */
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Valid email address is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.signup
);

/**
 * POST /api/auth/login
 * Checks email & compares bcrypt password, returns token and sanitized user
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email address is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

/**
 * GET /api/auth/me
 * Protected middleware. Verifies JWT token and returns current user details
 */
router.get("/me", authMiddleware, authController.me);

module.exports = router;
