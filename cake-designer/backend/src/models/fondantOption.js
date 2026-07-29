module.exports = (sequelize, DataTypes) => {
  const FondantOption = sequelize.define(
    "FondantOption",
    {
      fondant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      color_name: { type: DataTypes.STRING, allowNull: false },
      hex_code: { type: DataTypes.STRING, allowNull: true },
      price_modifier: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    { tableName: "fondant_options", timestamps: false }
  );

  FondantOption.associate = (db) => {
    FondantOption.hasMany(db.CustomCake, { foreignKey: "fondant_id" });
  };

  return FondantOption;
};
