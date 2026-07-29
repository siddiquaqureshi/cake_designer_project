module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "user_id",
      },
      id: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("user_id");
        },
        set(val) {
          this.setDataValue("user_id", val);
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash",
      },
      password_hash: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("password");
        },
        set(val) {
          this.setDataValue("password", val);
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "customer",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Sanitized public object without password
  User.prototype.toPublicJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_hash;
    return values;
  };

  User.associate = (db) => {
    if (db.UserProfile) User.hasOne(db.UserProfile, { foreignKey: "user_id" });
    if (db.UserAddress) User.hasMany(db.UserAddress, { foreignKey: "user_id" });
    if (db.CustomCake) User.hasMany(db.CustomCake, { foreignKey: "user_id" });
    if (db.Order) User.hasMany(db.Order, { foreignKey: "user_id", as: "orders" });
    if (db.Wishlist) User.hasMany(db.Wishlist, { foreignKey: "user_id" });
    if (db.Review) User.hasMany(db.Review, { foreignKey: "user_id" });
    if (db.NotificationLog) User.hasMany(db.NotificationLog, { foreignKey: "user_id" });
  };

  return User;
};

