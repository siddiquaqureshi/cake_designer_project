const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Authentication Middleware
 * Verifies JWT token attached in Authorization header (Bearer <token>)
 * Attaches authenticated user object to req.user
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
    const userId = decoded.id || decoded.user_id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists or invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Optional Authentication Middleware
 * If JWT is provided, verifies it and attaches user to req.user
 * If missing, proceeds without error (req.user remains undefined)
 */
const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
    const userId = decoded.id || decoded.user_id;
    const user = await User.findByPk(userId);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Optional token was invalid, continue as guest
  }
  next();
};

/**
 * Role Authorization Middleware
 * Restricts access to users with specified roles (case-insensitive)
 * e.g., requireRole('baker', 'admin')
 */
const requireRole = (...roles) => {
  const allowedRoles = roles.map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = String(req.user.role || "").toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access denied. Required role permission missing." });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireAuth: authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  roleCheck: requireRole,
};
