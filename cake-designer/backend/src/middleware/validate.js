const { validationResult } = require("express-validator");

// Runs after an express-validator chain; short-circuits with a 400 if any
// rule failed so controllers can assume req.body is already clean.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Validation failed", details: errors.array() });
  }
  next();
}

module.exports = validate;
