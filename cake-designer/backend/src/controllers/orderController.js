const { Order, User, UserAddress, OrderItem, OrderStatusHistory, Coupon, Payment, sequelize } = require("../models");

/**
 * POST /api/orders
 * Creates a new order. Accepts full cake JSON configuration, total price, delivery address, customer notes.
 * Associates with userId if user is logged in; supports guest checkout (userId = null) if not.
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      cakeDetails,
      cake,
      totalPrice,
      total_price,
      deliveryAddress,
      delivery_address,
      customerNotes,
      customer_notes,
      items,
      address_id,
      payment_method,
      coupon_code,
    } = req.body;

    // Resolve cake configuration object
    const finalCakeDetails = cakeDetails || cake || (items ? { items } : null);

    // Resolve total price
    const resolvedPrice = totalPrice !== undefined ? totalPrice : total_price;
    if (resolvedPrice === undefined || resolvedPrice === null) {
      return res.status(400).json({ error: "totalPrice is required" });
    }

    const priceNum = Number(resolvedPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "totalPrice must be a valid non-negative number" });
    }

    // Resolve delivery address
    let resolvedAddress = deliveryAddress || delivery_address || "";
    if (!resolvedAddress && address_id && req.user && UserAddress) {
      const addrObj = await UserAddress.findOne({
        where: { address_id, user_id: req.user.id },
      });
      if (addrObj) {
        resolvedAddress = `${addrObj.address_line}, ${addrObj.city} ${addrObj.postal_code || ""}`.trim();
      }
    }

    // Determine associated user (null if guest checkout)
    const userId = req.user ? req.user.id : null;
    const notes = customerNotes || customer_notes || null;

    const referenceImageUrl = req.file ? `/uploads/reference-images/${req.file.filename}` : req.body.reference_image_url || null;

    // Create the order entry
    const orderData = {
      userId,
      cakeDetails: finalCakeDetails,
      totalPrice: priceNum,
      status: "pending",
      customerNotes: notes,
      deliveryAddress: resolvedAddress,
    };

    const newOrder = await Order.create(orderData);

    // Populate relational helper tables if present in legacy schema
    try {
      if (OrderStatusHistory) {
        await OrderStatusHistory.create({
          order_id: newOrder.id,
          status: "pending",
        }).catch(() => null);
      }

      if (Payment) {
        await Payment.create({
          order_id: newOrder.id,
          amount: priceNum,
          currency: "PKR",
          status: "pending",
          payment_method: payment_method || "cod",
        }).catch(() => null);
      }
    } catch (subErr) {
      // Non-critical relational sync failure ignored for standalone Order creation
    }

    const createdOrder = await Order.findByPk(newOrder.id, {
      include: User ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "role"] }] : [],
    });

    return res.status(201).json(createdOrder || newOrder);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/my-orders
 * Protected customer route. Retrieves all orders belonging to the authenticated user.
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: User ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "role"] }] : [],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Protected Baker/Admin route. Retrieves all customer orders for Baker Dashboard view.
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: User ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "role"] }] : [],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Protected Baker/Admin route. Updates order status (pending -> confirmed -> baking -> ready -> delivered -> cancelled).
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, current_status } = req.body;

    const targetStatus = status || current_status;
    if (!targetStatus) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["pending", "confirmed", "baking", "ready", "delivered", "cancelled"];
    const normalizedStatus = String(targetStatus).toLowerCase();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ status: normalizedStatus });

    if (OrderStatusHistory) {
      await OrderStatusHistory.create({
        order_id: order.id,
        status: normalizedStatus,
      }).catch(() => null);
    }

    const updatedOrder = await Order.findByPk(order.id, {
      include: User ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "role"] }] : [],
    });

    return res.status(200).json(updatedOrder || order);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Retrieves order by ID for owner or Baker/Admin.
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: User ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "role"] }] : [],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const isOwner = req.user && order.userId === req.user.id;
    const userRole = req.user ? String(req.user.role).toLowerCase() : "";
    const isStaff = ["baker", "admin"].includes(userRole);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Access denied. You do not have permission to view this order." });
    }

    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};
