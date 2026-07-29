const { Coupon } = require("../models");

exports.validate = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ where: { code: (code || "").toUpperCase() } });
    if (!coupon || !coupon.is_active) {
      return res.status(404).json({ error: "That coupon code isn't valid" });
    }
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(410).json({ error: "That coupon has expired" });
    }
    res.json({ code: coupon.code, percentOff: coupon.discount_percentage / 100 });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json(await Coupon.findAll());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await Coupon.create(req.body));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    await coupon.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
