module.exports = (sequelize, DataTypes) => {
  const FrostingOption = sequelize.define(
    "FrostingOption",
    {
      frosting_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      texture_type: { type: DataTypes.STRING, allowNull: true },
      price_modifier: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    { tableName: "frosting_options", timestamps: false }
  );

  FrostingOption.associate = (db) => {
    FrostingOption.hasMany(db.CustomCake, { foreignKey: "frosting_id" });
  };

  return FrostingOption;
};
