module.exports = (sequelize, DataTypes) => {
  const Topping = sequelize.define(
    "Topping",
    {
      topping_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      price_per_item: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "toppings", timestamps: false }
  );

  Topping.associate = (db) => {
    Topping.hasMany(db.CustomCakeTopping, { foreignKey: "topping_id" });
  };

  return Topping;
};
