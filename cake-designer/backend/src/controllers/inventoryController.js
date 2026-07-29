const { CakeBase, Flavor, FondantOption, FrostingOption, Topping, CandleOption } = require("../models");

// One small CRUD factory shared by all six inventory catalogs instead of
// six near-identical copy-pasted controllers -- they differ only in which
// model they operate on.
function crudFor(model) {
  return {
    list: async (req, res, next) => {
      try {
        res.json(await model.findAll({ order: [[model.primaryKeyAttribute, "ASC"]] }));
      } catch (err) {
        next(err);
      }
    },
    create: async (req, res, next) => {
      try {
        res.status(201).json(await model.create(req.body));
      } catch (err) {
        next(err);
      }
    },
    update: async (req, res, next) => {
      try {
        const row = await model.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: "Not found" });
        await row.update(req.body);
        res.json(row);
      } catch (err) {
        next(err);
      }
    },
    remove: async (req, res, next) => {
      try {
        const row = await model.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: "Not found" });
        await row.destroy();
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}

exports.cakeBases = crudFor(CakeBase);
exports.flavors = crudFor(Flavor);
exports.fondants = crudFor(FondantOption);
exports.frostings = crudFor(FrostingOption);
exports.toppings = crudFor(Topping);
exports.candles = crudFor(CandleOption);

// One combined call for the frontend's "load everything the decorator
// needs" useEffect, so it isn't six separate round trips.
exports.allOptions = async (req, res, next) => {
  try {
    const [cakeBases, flavors, fondants, frostings, toppings, candles] = await Promise.all([
      CakeBase.findAll(),
      Flavor.findAll(),
      FondantOption.findAll(),
      FrostingOption.findAll(),
      Topping.findAll(),
      CandleOption.findAll(),
    ]);
    res.json({
      shapes: cakeBases,
      flavors,
      fondants,
      frostings,
      toppings,
      candles: candles.filter((c) => c.type === "Candle"),
      sparklers: candles.filter((c) => c.type === "Sparkler"),
    });
  } catch (err) {
    next(err);
  }
};
