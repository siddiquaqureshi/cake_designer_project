module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      coupon_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      discount_percentage: { type: DataTypes.INTEGER, allowNull: false },
      expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: "coupons", timestamps: false }
  );

  Coupon.associate = (db) => {
    Coupon.hasMany(db.Order, { foreignKey: "coupon_id" });
  };

  return Coupon;
};
