const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/inventoryController");

// Public reads -- anyone browsing the decorator needs these without logging in.
router.get("/options", ctrl.allOptions);
router.get("/cake-bases", ctrl.cakeBases.list);
router.get("/flavors", ctrl.flavors.list);
router.get("/fondants", ctrl.fondants.list);
router.get("/frostings", ctrl.frostings.list);
router.get("/toppings", ctrl.toppings.list);
router.get("/candles", ctrl.candles.list);

// Baker/Admin-only writes for managing the catalog.
const staffOnly = [requireAuth, requireRole("Baker", "Admin")];
router.post("/cake-bases", staffOnly, ctrl.cakeBases.create);
router.put("/cake-bases/:id", staffOnly, ctrl.cakeBases.update);
router.delete("/cake-bases/:id", staffOnly, ctrl.cakeBases.remove);

router.post("/flavors", staffOnly, ctrl.flavors.create);
router.put("/flavors/:id", staffOnly, ctrl.flavors.update);
router.delete("/flavors/:id", staffOnly, ctrl.flavors.remove);

router.post("/fondants", staffOnly, ctrl.fondants.create);
router.put("/fondants/:id", staffOnly, ctrl.fondants.update);
router.delete("/fondants/:id", staffOnly, ctrl.fondants.remove);

router.post("/frostings", staffOnly, ctrl.frostings.create);
router.put("/frostings/:id", staffOnly, ctrl.frostings.update);
router.delete("/frostings/:id", staffOnly, ctrl.frostings.remove);

router.post("/toppings", staffOnly, ctrl.toppings.create);
router.put("/toppings/:id", staffOnly, ctrl.toppings.update);
router.delete("/toppings/:id", staffOnly, ctrl.toppings.remove);

router.post("/candles", staffOnly, ctrl.candles.create);
router.put("/candles/:id", staffOnly, ctrl.candles.update);
router.delete("/candles/:id", staffOnly, ctrl.candles.remove);

module.exports = router;
