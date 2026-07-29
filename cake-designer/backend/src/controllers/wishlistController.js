const { Wishlist, CustomCake, CakeBase, Flavor, FondantOption, FrostingOption } = require("../models");

exports.list = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.user_id },
      include: [{ model: CustomCake, include: [CakeBase, Flavor, FondantOption, FrostingOption] }],
      order: [["wishlist_id", "DESC"]],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.add = async (req, res, next) => {
  try {
    const { custom_cake_id } = req.body;
    const existing = await Wishlist.findOne({ where: { user_id: req.user.user_id, custom_cake_id } });
    if (existing) return res.status(200).json(existing);
    const item = await Wishlist.create({ user_id: req.user.user_id, custom_cake_id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({
      where: { wishlist_id: req.params.id, user_id: req.user.user_id },
    });
    if (!item) return res.status(404).json({ error: "Wishlist item not found" });
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
