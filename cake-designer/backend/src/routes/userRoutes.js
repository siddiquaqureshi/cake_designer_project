const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/userController");

router.use(requireAuth);

router.put(
  "/profile",
  [body("first_name").notEmpty(), body("last_name").notEmpty()],
  validate,
  ctrl.updateProfile
);

router.get("/addresses", ctrl.listAddresses);
router.post(
  "/addresses",
  [body("address_line").notEmpty(), body("city").notEmpty()],
  validate,
  ctrl.createAddress
);
router.put("/addresses/:id", ctrl.updateAddress);
router.delete("/addresses/:id", ctrl.deleteAddress);

module.exports = router;
