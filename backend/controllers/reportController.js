const Report = require("../models/Report");

exports.reportUser = async (req, res) => {
  const { reportedUserId, reason, details, targetType } = req.body;
  try {
    const report = new Report({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      details,
      reportedUser: targetType === "user" ? reportedUserId : undefined,
      donation: targetType === "donation" ? donationId : undefined,
    });
    await report.save();
    res.status(201).json({ message: "Report submitted" });
  } catch (err) {
    console.error("❌ Report save error:", err); // طباعة الخطأ الحقيقي في السيرفر
    res
      .status(500)
      .json({ message: "Error saving report", error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};
