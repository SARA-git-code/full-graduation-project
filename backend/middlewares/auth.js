const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
     const token = req.cookies.token 
    //   ||(req.headers.authorization?.startsWith("Bearer ")
    //     ? req.headers.authorization.split(" ")[1]
    //     : null);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded); // Debug log

    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("👤 Authenticated User:", user._id); // Debug log
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message); // Debug log
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

