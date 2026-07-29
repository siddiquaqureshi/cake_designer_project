module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define(
    "UserProfile",
    {
      profile_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      phone_number: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "user_profiles", timestamps: false }
  );

  UserProfile.associate = (db) => {
    UserProfile.belongsTo(db.User, { foreignKey: "user_id" });
  };

  return UserProfile;
};
