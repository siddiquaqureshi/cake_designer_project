module.exports = (sequelize, DataTypes) => {
  const CandleOption = sequelize.define(
    "CandleOption",
    {
      candle_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.ENUM("Candle", "Sparkler"), allowNull: false },
      color_style: { type: DataTypes.STRING, allowNull: true },
      price_per_item: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "candle_options", timestamps: false }
  );

  CandleOption.associate = (db) => {
    CandleOption.hasMany(db.CustomCakeCandle, { foreignKey: "candle_id" });
  };

  return CandleOption;
};
