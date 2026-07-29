const { Payment, Order } = require("../models");

let stripeClient = null;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env before creating checkout sessions.");
  }

  if (!stripeClient) {
    stripeClient = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

// Stripe is stubbed rather than actually integrated (no live keys in this
// environment) -- stripe_payment_intent_id is populated with a clearly-fake
// placeholder so the field mapping matches the schema exactly and swapping
// in a real Stripe SDK call later is a one-function change, not a schema
// change.
exports.create = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user_id !== req.user.user_id) return res.status(403).json({ error: "Not your order" });

    const existingPayment = await Payment.findOne({ where: { order_id } });
    if (existingPayment) {
      await order.update({ payment_status: "Paid" });
      return res.status(200).json(existingPayment);
    }

    const fakeIntentId = `pi_mock_${Date.now()}`;
    const payment = await Payment.create({
      order_id,
      stripe_payment_intent_id: fakeIntentId,
      amount: order.total_price,
      currency: "PKR",
      status: "succeeded",
    });

    await order.update({ payment_status: "Paid" });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user_id !== req.user.user_id) return res.status(403).json({ error: "Not your order" });

    const clientUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const normalizedOrigin = clientUrl.replace(/\/$/, "");
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Cake Order #${order_id}`,
              description: `Custom cake order from Cake Designer`,
            },
            unit_amount: Math.round(Number(order.total_price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${normalizedOrigin}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order_id}`,
      cancel_url: `${normalizedOrigin}/order/cancel?order_id=${order_id}`,
      metadata: {
        order_id: String(order_id),
        user_id: String(req.user.user_id),
      },
    });

    res.status(201).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

exports.verifySession = async (req, res, next) => {
  try {
    const { session_id, order_id } = req.body;

    let payment = await Payment.findOne({ where: { order_id } });
    if (payment) {
      return res.json({ status: "success", payment });
    }

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user_id !== req.user.user_id) return res.status(403).json({ error: "Not your order" });

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment has not been completed" });
    }

    payment = await Payment.create({
      order_id,
      stripe_payment_intent_id: session.payment_intent || null,
      amount: order.total_price,
      currency: (session.currency || "pkr").toUpperCase(),
      status: "succeeded",
      payment_method: "card",
    });

    await order.update({ payment_status: "Paid" });

    res.status(201).json({ status: "success", payment });
  } catch (err) {
    next(err);
  }
};

exports.getForOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.status(404).json({ error: "No payment found for this order" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

