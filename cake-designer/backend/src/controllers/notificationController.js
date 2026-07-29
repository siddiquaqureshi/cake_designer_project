const { NotificationLog } = require("../models");

exports.listMine = async (req, res, next) => {
  try {
    const logs = await NotificationLog.findAll({
      where: { user_id: req.user.user_id },
      order: [["log_id", "DESC"]],
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// Used internally (order placed/status changed) rather than hit directly
// by the frontend -- exposed here so it's demoable/testable via Postman too.
exports.create = async (req, res, next) => {
  try {
    const { user_id, notification_type, recipient_number, status } = req.body;
    const log = await NotificationLog.create({
      user_id,
      notification_type,
      recipient_number,
      status: status || "sent",
      sent_at: new Date(),
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};
