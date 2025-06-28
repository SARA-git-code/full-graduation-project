const Donation = require("../models/Donation");
const User = require("../models/User");

exports.getStats = async (req, res) => {
  try {
    const items = await Donation.countDocuments();
    const users = await User.countDocuments();
    const impact = Math.round(items * 1.2); // مثال لحساب "Lives Impacted"
    res.json({ items, users, impact });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
