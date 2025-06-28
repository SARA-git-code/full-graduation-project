const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth");
const {
  getAllUsers,
  toggleBanUser,
  toggleAdminRole,
  deleteUserByAdmin,
  getAllDonations,
  toggleDonationVisibility,
  deleteDonationByAdmin,
  getAllReports,
  deleteReport,
} = require("../controllers/adminController");

// 🧑‍💼 عرض كل المستخدمين
router.get("/users", protect, adminOnly, getAllUsers);

// 🚫 حظر أو إلغاء حظر مستخدم
router.patch("/users/:id/ban", protect, adminOnly, toggleBanUser);

// 🔁 تعيين أو إزالة أدمن
router.patch("/users/:id/role", protect, adminOnly, toggleAdminRole);

// ❌ حذف مستخدم
router.delete("/users/:id", protect, adminOnly, deleteUserByAdmin);

router.get("/donations", protect, adminOnly, getAllDonations);
router.patch("/donations/:id/visibility", protect, adminOnly, toggleDonationVisibility);
router.delete("/donations/:id", protect, adminOnly, deleteDonationByAdmin);

router.get("/reports", protect, adminOnly, getAllReports);
router.delete("/reports/:id", protect, adminOnly, deleteReport);

router.get("/summary", protect, adminOnly, async (req, res) => {
  const User = require("../models/User");
  const Donation = require("../models/Donation");
  const Report = require("../models/Report");

  try {
    const [users, donations, reports] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Report.countDocuments(),
    ]);
    res.json({ users, donations, reports });
  } catch (err) {
    res.status(500).json({ message: "Failed to load summary" });
  }
});


module.exports = router;
