module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define(
    "UserAddress",
    {
      address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      address_line: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      postal_code: { type: DataTypes.STRING, allowNull: true },
      is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "user_addresses", timestamps: false }
  );

  UserAddress.associate = (db) => {
    UserAddress.belongsTo(db.User, { foreignKey: "user_id" });
    UserAddress.hasMany(db.Order, { foreignKey: "address_id" });
  };

  return UserAddress;
};
