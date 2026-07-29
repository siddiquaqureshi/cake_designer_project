const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, UserProfile } = require("../models");

function signToken(user) {
  return jwt.sign(
    { id: user.id, user_id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser(user, profile = null) {
  const userJson = user.toPublicJSON ? user.toPublicJSON() : { ...user.get() };
  delete userJson.password;
  delete userJson.password_hash;

  if (profile) {
    userJson.first_name = profile.first_name;
    userJson.last_name = profile.last_name;
    userJson.phone_number = profile.phone_number;
  }
  return userJson;
}

exports.signup = async (req, res, next) => {
  try {
    const { name, first_name, last_name, email, password, phone, phone_number, role } = req.body;

    // Resolve full name if first_name / last_name provided
    const fullName = name ? name.trim() : `${first_name || ""} ${last_name || ""}`.trim();

    if (!fullName) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role ? String(role).toLowerCase() : "customer";
    const userRole = ["customer", "baker", "admin"].includes(normalizedRole) ? normalizedRole : "customer";
    const userPhone = phone || phone_number || null;

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      phone: userPhone,
      role: userRole,
    });

    // If UserProfile model exists, populate for compatibility
    let profile = null;
    if (UserProfile) {
      const [fName, ...lRest] = fullName.split(" ");
      profile = await UserProfile.create({
        user_id: user.id,
        first_name: first_name || fName,
        last_name: last_name || lRest.join(" ") || fName,
        phone_number: userPhone,
      }).catch(() => null);
    }

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user, profile),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let profile = null;
    if (UserProfile) {
      profile = await UserProfile.findOne({ where: { user_id: user.id } }).catch(() => null);
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: sanitizeUser(user, profile),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let profile = null;
    if (UserProfile) {
      profile = await UserProfile.findOne({ where: { user_id: req.user.id } }).catch(() => null);
    }

    return res.status(200).json({
      user: sanitizeUser(req.user, profile),
    });
  } catch (err) {
    next(err);
  }
};
