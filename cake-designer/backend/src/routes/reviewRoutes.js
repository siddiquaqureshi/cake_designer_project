const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/reviewController");

router.get("/for-cake/:customCakeId", ctrl.listForCake);
router.post(
  "/",
  requireAuth,
  [body("custom_cake_id").isInt(), body("rating").isInt({ min: 1, max: 5 })],
  validate,
  ctrl.create
);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
