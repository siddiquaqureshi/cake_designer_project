module.exports = (sequelize, DataTypes) => {
  const CustomCake = sequelize.define(
    "CustomCake",
    {
      custom_cake_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true }, // nullable for guests, per schema
      cake_base_id: { type: DataTypes.INTEGER, allowNull: false },
      flavor_id: { type: DataTypes.INTEGER, allowNull: false },
      fondant_id: { type: DataTypes.INTEGER, allowNull: true },
      frosting_id: { type: DataTypes.INTEGER, allowNull: true },
      layers_count: { type: DataTypes.INTEGER, defaultValue: 1 },
      custom_text: { type: DataTypes.STRING, allowNull: true },
      text_x: { type: DataTypes.INTEGER, allowNull: true },
      text_y: { type: DataTypes.INTEGER, allowNull: true },
      text_rotation: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      canvas_snapshot_url: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "custom_cakes", timestamps: false }
  );

  CustomCake.associate = (db) => {
    CustomCake.belongsTo(db.User, { foreignKey: "user_id" });
    CustomCake.belongsTo(db.CakeBase, { foreignKey: "cake_base_id" });
    CustomCake.belongsTo(db.Flavor, { foreignKey: "flavor_id" });
    CustomCake.belongsTo(db.FondantOption, { foreignKey: "fondant_id" });
    CustomCake.belongsTo(db.FrostingOption, { foreignKey: "frosting_id" });
    CustomCake.hasMany(db.CustomCakeTopping, { foreignKey: "custom_cake_id", as: "toppings" });
    CustomCake.hasMany(db.CustomCakeCandle, { foreignKey: "custom_cake_id", as: "candles" });
    CustomCake.hasMany(db.OrderItem, { foreignKey: "custom_cake_id" });
    CustomCake.hasMany(db.Wishlist, { foreignKey: "custom_cake_id" });
    CustomCake.hasMany(db.Review, { foreignKey: "custom_cake_id" });
  };

  return CustomCake;
};
