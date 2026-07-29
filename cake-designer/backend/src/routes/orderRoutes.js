const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { authMiddleware, optionalAuthMiddleware, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const orderController = require("../controllers/orderController");

/**
 * POST /api/orders
 * Creates a new order. Accepts full cake JSON configuration, total price, delivery address, customer notes.
 * Optional authentication: associates with logged-in user if token provided, allows guest checkout if not.
 */
router.post(
  "/",
  upload.single("reference_image"),
  optionalAuthMiddleware,
  orderController.createOrder
);

/**
 * GET /api/orders/my-orders
 * Protected customer route. Retrieves all orders belonging to the authenticated user.
 */
router.get("/my-orders", authMiddleware, orderController.getMyOrders);
router.get("/mine", authMiddleware, orderController.getMyOrders); // Compatibility alias

/**
 * GET /api/orders
 * Protected Baker/Admin route. Retrieves all customer orders for the Baker Dashboard view.
 */
router.get("/", authMiddleware, requireRole("baker", "admin"), orderController.getAllOrders);
router.get("/all", authMiddleware, requireRole("baker", "admin"), orderController.getAllOrders); // Compatibility alias

/**
 * PATCH /api/orders/:id/status
 * Protected Baker/Admin route. Updates order status (pending -> confirmed -> baking -> ready -> delivered -> cancelled).
 */
router.patch("/:id/status", authMiddleware, requireRole("baker", "admin"), orderController.updateOrderStatus);

/**
 * GET /api/orders/:id
 * Protected route. Retrieves specific order details by ID.
 */
router.get("/:id", authMiddleware, orderController.getOrderById);

module.exports = router;
