const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/paymentController");

router.use(requireAuth);
router.post("/", ctrl.create);
router.post("/checkout-session", ctrl.createCheckoutSession);
router.post("/verify-session", ctrl.verifySession);
router.get("/order/:orderId", ctrl.getForOrder);

module.exports = router;
