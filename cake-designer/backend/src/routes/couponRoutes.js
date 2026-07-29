const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/couponController");

router.post("/validate", [body("code").notEmpty()], validate, ctrl.validate);

const staffOnly = [requireAuth, requireRole("Baker", "Admin")];
router.get("/", staffOnly, ctrl.list);
router.post("/", staffOnly, ctrl.create);
router.put("/:id", staffOnly, ctrl.update);
router.delete("/:id", staffOnly, ctrl.remove);

module.exports = router;
