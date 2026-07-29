module.exports = (sequelize, DataTypes) => {
  const NotificationLog = sequelize.define(
    "NotificationLog",
    {
      log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      notification_type: { type: DataTypes.STRING, allowNull: false },
      recipient_number: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
      sent_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "notification_logs", timestamps: false }
  );

  NotificationLog.associate = (db) => {
    NotificationLog.belongsTo(db.User, { foreignKey: "user_id" });
  };

  return NotificationLog;
};
