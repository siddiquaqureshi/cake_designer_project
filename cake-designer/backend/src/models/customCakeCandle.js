module.exports = (sequelize, DataTypes) => {
  const CustomCakeCandle = sequelize.define(
    "CustomCakeCandle",
    {
      custom_cake_candle_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      custom_cake_id: { type: DataTypes.INTEGER, allowNull: false },
      candle_id: { type: DataTypes.INTEGER, allowNull: false },
      coordinate_x: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      coordinate_y: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    },
    { tableName: "custom_cake_candles", timestamps: false }
  );

  CustomCakeCandle.associate = (db) => {
    CustomCakeCandle.belongsTo(db.CustomCake, { foreignKey: "custom_cake_id" });
    CustomCakeCandle.belongsTo(db.CandleOption, { foreignKey: "candle_id" });
  };

  return CustomCakeCandle;
};
