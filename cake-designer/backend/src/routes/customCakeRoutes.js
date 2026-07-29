const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/customCakeController");

// Optional auth: guests can build/save a custom cake (user_id nullable per
// schema), but if a token IS present we attach req.user so it gets linked
// to their account instead of staying anonymous.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next();
  requireAuth(req, res, next);
}

router.post(
  "/",
  optionalAuth,
  [
    body("cake_base_id").isInt(),
    body("flavor_id").isInt(),
    body("layers_count").optional().isInt({ min: 1, max: 10 }),
  ],
  validate,
  ctrl.create
);
router.get("/mine", requireAuth, ctrl.listMine);
router.get("/:id", ctrl.getById);

module.exports = router;
