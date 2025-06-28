const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
  targetType: { type: String, enum: ["user", "donation"], default: "user" },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" }
});

module.exports = mongoose.model("Report", reportSchema);
