module.exports = (sequelize, DataTypes) => {
  const Flavor = sequelize.define(
    "Flavor",
    {
      flavor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: true },
      price_modifier: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    { tableName: "flavors", timestamps: false }
  );

  Flavor.associate = (db) => {
    Flavor.hasMany(db.CustomCake, { foreignKey: "flavor_id" });
  };

  return Flavor;
};
