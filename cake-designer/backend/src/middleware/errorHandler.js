// Centralized error handler -- every controller forwards errors here via
// next(err) instead of formatting its own response.
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors?.map((e) => e.message),
    });
  }
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Something went wrong" });
}

module.exports = { notFound, errorHandler };
