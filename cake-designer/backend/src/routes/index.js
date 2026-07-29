const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/", require("./inventoryRoutes")); // /options, /cake-bases, /flavors, ...
router.use("/custom-cakes", require("./customCakeRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/wishlist", require("./wishlistRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/notifications", require("./notificationRoutes"));

module.exports = router;
