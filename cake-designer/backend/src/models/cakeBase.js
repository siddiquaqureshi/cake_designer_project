module.exports = (sequelize, DataTypes) => {
  const CakeBase = sequelize.define(
    "CakeBase",
    {
      cake_base_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      shape: { type: DataTypes.STRING, allowNull: false },
      base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "cake_bases", timestamps: false }
  );

  CakeBase.associate = (db) => {
    CakeBase.hasMany(db.CustomCake, { foreignKey: "cake_base_id" });
  };

  return CakeBase;
};
