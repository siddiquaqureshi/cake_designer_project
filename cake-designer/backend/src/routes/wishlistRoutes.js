const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/wishlistController");

router.use(requireAuth);
router.get("/", ctrl.list);
router.post("/", [body("custom_cake_id").isInt()], validate, ctrl.add);
router.delete("/:id", ctrl.remove);

module.exports = router;
