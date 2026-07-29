module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      custom_cake_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      purchase_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "order_items", timestamps: false }
  );

  OrderItem.associate = (db) => {
    OrderItem.belongsTo(db.Order, { foreignKey: "order_id" });
    OrderItem.belongsTo(db.CustomCake, { foreignKey: "custom_cake_id" });
  };

  return OrderItem;
};
