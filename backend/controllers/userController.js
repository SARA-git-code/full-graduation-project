const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const UserActivity = require("../models/UserActivity");
const Donation = require("../models/Donation");


const { sendResetCode, sendPasswordChangedEmail } = require("../utils/mailer");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users: " + err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile: " + err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
       console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    const userId = req.user._id;
    const updateFields = {
      name: req.body.name,
      location: req.body.location,
      phone: req.body.phone,
      description: req.body.description,
      showPhone: req.body.showPhone === "true" || req.body.showPhone === true,
    };
    // ✅ معالجة صورة البروفايل
    if (req.files?.profileImage?.[0]) {
      updateFields.profileImage = req.files.profileImage[0].filename;
    } else if (req.body.existingProfileImage) {
      // استخرج فقط اسم الملف من الرابط الكامل
      const existingProfile = req.body.existingProfileImage.split("/uploads/")[1];
      updateFields.profileImage = existingProfile;
    }
    // ✅ معالجة صورة الخلفية
    if (req.files?.backgroundImage?.[0]) {
      updateFields.backgroundImage = req.files.backgroundImage[0].filename;
    } else if (req.body.existingBackgroundImage) {
      const existingBackground = req.body.existingBackgroundImage.split("/uploads/")[1];
      updateFields.backgroundImage = existingBackground;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select("-password");
    res.json({
      ...updatedUser.toObject(),
      profileImage: updatedUser.profileImage
        ? `http://localhost:5050/uploads/${updatedUser.profileImage}`
        : null,
      backgroundImage: updatedUser.backgroundImage
        ? `http://localhost:5050/uploads/${updatedUser.backgroundImage}`
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed: " + err.message });
  }
};

exports.saveDonation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.savedDonations.includes(req.params.donationId)) {
      return res.status(400).json({ message: "Donation already saved" });
    }

    user.savedDonations.push(req.params.donationId);
    await user.save();
    await Donation.findByIdAndUpdate(req.params.donationId, {
      $inc: { interactions: 1 },
    });
    try {
  const donation = await Donation.findById(donationId); // أو req.body.donationId
  if (donation) {
    await UserActivity.create({
      user: req.user._id,
      kind: donation.kind,
      location: donation.location,
      action: "save",
    });
  }
} catch (err) {
  console.error("❌ Failed to record save activity:", err.message);
}

    res.json({ message: "Donation saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Save failed: " + err.message });
  }
};

exports.unsaveDonation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.savedDonations = user.savedDonations.filter(
      (id) => id.toString() !== req.params.donationId
    );
    await user.save();

    res.json({ message: "Donation unsaved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Unsave failed: " + err.message });
  }
};

exports.getSavedDonations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedDonations",
      populate: { path: "user", select: "name" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.savedDonations);
  } catch (err) {
    console.error("❌ Populate error:", err); // ✅ اطبع الخطأ
    res.status(500).json({ message: "Populate error: " + err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("📩 Request Password Reset Reached");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // ✅ استدعاء دالة الإرسال بالبريد
    const { sendResetCode } = require("../utils/mailer");
    await sendResetCode(email, code); // 👈 إرسال الكود عبر الإيميل

    console.log(`📨 Reset code sent to ${email}: ${code}`);
    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("❌ Reset Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  const user = await User.findOne({ email, resetCode: code });

  if (!user || user.resetCodeExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  user.password = await bcrypt.hash(password, 10); // ✅ استخدم password بدل newPassword
  user.resetCode = null;
  user.resetCodeExpires = null;

  await user.save();

  res.json({ message: "Password has been reset successfully" });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save(); // ✅ حفظ الباسورد

    // ✅ إرسال إيميل تأكيد بعد تغيير الباسورد
    // await sendPasswordChangedEmail(user.email, user.name);
res.clearCookie("token");

    return res.status(200).json({ message: "Password changed. Please log in again." });
    // res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Change Password Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { language, theme } = req.body;
    user.language = language || user.language;
    user.theme = theme || user.theme;
    await user.save();
    res.json({
      message: "Settings updated successfully",
      language: user.language,
      theme: user.theme,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update settings: " + err.message });
  }
};
