const { CustomCake, CustomCakeTopping, CustomCakeCandle, CakeBase, Flavor, FondantOption, FrostingOption, Topping, CandleOption, sequelize } = require("../models");

const includeGraph = [
  { model: CakeBase },
  { model: Flavor },
  { model: FondantOption },
  { model: FrostingOption },
  { model: CustomCakeTopping, as: "toppings", include: [Topping] },
  { model: CustomCakeCandle, as: "candles", include: [CandleOption] },
];

exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      cake_base_id,
      flavor_id,
      fondant_id,
      frosting_id,
      layers_count,
      custom_text,
      text_x,
      text_y,
      text_rotation,
      canvas_snapshot_url,
      toppings = [],
      candles = [],
    } = req.body;

    const cake = await CustomCake.create(
      {
        user_id: req.user?.user_id || null, // nullable for guests, per schema
        cake_base_id,
        flavor_id,
        fondant_id,
        frosting_id,
        layers_count,
        custom_text,
        text_x,
        text_y,
        text_rotation,
        canvas_snapshot_url,
      },
      { transaction: t }
    );

    if (toppings.length) {
      await CustomCakeTopping.bulkCreate(
        toppings.map((tp) => ({
          custom_cake_id: cake.custom_cake_id,
          topping_id: tp.topping_id,
          coordinate_x: tp.coordinate_x,
          coordinate_y: tp.coordinate_y,
        })),
        { transaction: t }
      );
    }

    if (candles.length) {
      await CustomCakeCandle.bulkCreate(
        candles.map((c) => ({
          custom_cake_id: cake.custom_cake_id,
          candle_id: c.candle_id,
          coordinate_x: c.coordinate_x,
          coordinate_y: c.coordinate_y,
        })),
        { transaction: t }
      );
    }

    await t.commit();
    const full = await CustomCake.findByPk(cake.custom_cake_id, { include: includeGraph });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const cake = await CustomCake.findByPk(req.params.id, { include: includeGraph });
    if (!cake) return res.status(404).json({ error: "Custom cake not found" });
    res.json(cake);
  } catch (err) {
    next(err);
  }
};

exports.listMine = async (req, res, next) => {
  try {
    const cakes = await CustomCake.findAll({
      where: { user_id: req.user.user_id },
      include: includeGraph,
      order: [["custom_cake_id", "DESC"]],
    });
    res.json(cakes);
  } catch (err) {
    next(err);
  }
};
