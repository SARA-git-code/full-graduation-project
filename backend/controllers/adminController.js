const User = require("../models/User");
const Donation = require("../models/Donation");
const Report = require("../models/Report");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ message: "User ban status updated", isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ban" });
  }
};

exports.toggleAdminRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.json({ message: "User role updated", role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};


exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate("user", "name email");
    res.json(donations);
  } catch (err) {
    console.error("❌ Failed to fetch donations:", err.message);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

exports.toggleDonationVisibility = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.isVisible = donation.isVisible === false ? true : false;
    await donation.save();

    res.json({ message: "Visibility updated", isVisible: donation.isVisible });
  } catch (err) {
    res.status(500).json({ message: "Failed to update visibility" });
  }
};

exports.deleteDonationByAdmin = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.json({ message: "Donation deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete donation" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name")
      .populate("reportedUser", "name")
      .populate("donation", "title");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report" });
  }
};
