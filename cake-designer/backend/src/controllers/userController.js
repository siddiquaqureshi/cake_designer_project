const { UserProfile, UserAddress } = require("../models");

exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone_number } = req.body;
    const [profile] = await UserProfile.upsert({
      user_id: req.user.user_id,
      first_name,
      last_name,
      phone_number,
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.listAddresses = async (req, res, next) => {
  try {
    const addresses = await UserAddress.findAll({ where: { user_id: req.user.user_id } });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const { address_line, city, postal_code, is_default } = req.body;
    if (is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.user_id } });
    }
    const address = await UserAddress.create({
      user_id: req.user.user_id,
      address_line,
      city,
      postal_code,
      is_default: !!is_default,
    });
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = await UserAddress.findOne({
      where: { address_id: req.params.id, user_id: req.user.user_id },
    });
    if (!address) return res.status(404).json({ error: "Address not found" });
    await address.update(req.body);
    res.json(address);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await UserAddress.findOne({
      where: { address_id: req.params.id, user_id: req.user.user_id },
    });
    if (!address) return res.status(404).json({ error: "Address not found" });
    await address.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
