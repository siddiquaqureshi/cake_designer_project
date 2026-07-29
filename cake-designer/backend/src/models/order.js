module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "order_id",
      },
      id: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("order_id");
        },
        set(val) {
          this.setDataValue("order_id", val);
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
        references: {
          model: "users",
          key: "user_id",
        },
      },
      userId: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("user_id");
        },
        set(val) {
          this.setDataValue("user_id", val);
        },
      },
      cake_details: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "cake_details",
      },
      cakeDetails: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("cake_details");
        },
        set(val) {
          this.setDataValue("cake_details", val);
        },
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_price",
      },
      totalPrice: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("total_price");
        },
        set(val) {
          this.setDataValue("total_price", val);
        },
      },
      current_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        field: "current_status",
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("current_status");
        },
        set(val) {
          this.setDataValue("current_status", val);
        },
      },
      customer_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "customer_notes",
      },
      customerNotes: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("customer_notes");
        },
        set(val) {
          this.setDataValue("customer_notes", val);
        },
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "delivery_address",
      },
      deliveryAddress: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("delivery_address");
        },
        set(val) {
          this.setDataValue("delivery_address", val);
        },
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Order.associate = (db) => {
    Order.belongsTo(db.User, { foreignKey: "user_id", as: "user" });
    if (db.OrderItem) Order.hasMany(db.OrderItem, { foreignKey: "order_id" });
    if (db.OrderStatusHistory) Order.hasMany(db.OrderStatusHistory, { foreignKey: "order_id" });
    if (db.Payment) Order.hasOne(db.Payment, { foreignKey: "order_id" });
    if (db.UserAddress) Order.belongsTo(db.UserAddress, { foreignKey: "address_id" });
    if (db.Coupon) Order.belongsTo(db.Coupon, { foreignKey: "coupon_id" });
  };

  return Order;
};

