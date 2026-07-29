const { Review, User } = require("../models");

exports.listForCake = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { custom_cake_id: req.params.customCakeId },
      include: [{ model: User, attributes: ["user_id", "email"] }],
      order: [["review_id", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { custom_cake_id, rating, comment } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5" });
    const review = await Review.create({ user_id: req.user.user_id, custom_cake_id, rating, comment });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: { review_id: req.params.id, user_id: req.user.user_id },
    });
    if (!review) return res.status(404).json({ error: "Review not found" });
    await review.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
