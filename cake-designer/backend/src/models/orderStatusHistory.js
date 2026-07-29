module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      history_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "order_status_history", timestamps: false }
  );

  OrderStatusHistory.associate = (db) => {
    OrderStatusHistory.belongsTo(db.Order, { foreignKey: "order_id" });
  };

  return OrderStatusHistory;
};
