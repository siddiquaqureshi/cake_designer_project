module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      stripe_payment_intent_id: { type: DataTypes.STRING, allowNull: true },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      currency: { type: DataTypes.STRING, defaultValue: "PKR" },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
      payment_method: { type: DataTypes.STRING, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "payments", timestamps: false }
  );

  Payment.associate = (db) => {
    Payment.belongsTo(db.Order, { foreignKey: "order_id" });
  };

  return Payment;
};
