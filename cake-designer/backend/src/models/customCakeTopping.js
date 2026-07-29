module.exports = (sequelize, DataTypes) => {
  const CustomCakeTopping = sequelize.define(
    "CustomCakeTopping",
    {
      custom_cake_topping_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      custom_cake_id: { type: DataTypes.INTEGER, allowNull: false },
      topping_id: { type: DataTypes.INTEGER, allowNull: false },
      coordinate_x: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      coordinate_y: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    },
    { tableName: "custom_cake_toppings", timestamps: false }
  );

  CustomCakeTopping.associate = (db) => {
    CustomCakeTopping.belongsTo(db.CustomCake, { foreignKey: "custom_cake_id" });
    CustomCakeTopping.belongsTo(db.Topping, { foreignKey: "topping_id" });
  };

  return CustomCakeTopping;
};
