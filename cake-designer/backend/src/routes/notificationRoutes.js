const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.use(requireAuth);
router.get("/mine", ctrl.listMine);
router.post("/", requireRole("Baker", "Admin"), ctrl.create);

module.exports = router;
