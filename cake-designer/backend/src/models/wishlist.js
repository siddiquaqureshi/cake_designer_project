module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      wishlist_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      custom_cake_id: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "wishlists", timestamps: false }
  );

  Wishlist.associate = (db) => {
    Wishlist.belongsTo(db.User, { foreignKey: "user_id" });
    Wishlist.belongsTo(db.CustomCake, { foreignKey: "custom_cake_id" });
  };

  return Wishlist;
};
