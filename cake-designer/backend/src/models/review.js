module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      custom_cake_id: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      comment: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "reviews", timestamps: false }
  );

  Review.associate = (db) => {
    Review.belongsTo(db.User, { foreignKey: "user_id" });
    Review.belongsTo(db.CustomCake, { foreignKey: "custom_cake_id" });
  };

  return Review;
};
