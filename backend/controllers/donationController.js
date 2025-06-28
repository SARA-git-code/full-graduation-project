const Donation = require("../models/Donation");
const mongoose = require("mongoose");
const UserActivity = require("../models/UserActivity");

// Create Donation
exports.createDonation = async (req, res) => {
  try {
    if (!req.files || req.files.length < 1) {
      return res
        .status(400)
        .json({ message: "At least 1 images are required" });
    }

    // ✅ تحقق من الحقول الإضافية حسب النوع
    if (req.body.kind === "food" && !req.body.expireDate) {
      return res
        .status(400)
        .json({ message: "Expire date is required for food donations" });
    }

    if (!req.body.condition || !["new", "used"].includes(req.body.condition)) {
      return res
        .status(400)
        .json({ message: "Condition (new/used) is required" });
    }

    const images = req.files.map((file) => file.filename);

    const donation = await Donation.create({
      ...req.body,
      user: req.user._id,
      images,
       isValid: true 
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: "Create donation failed: " + err.message });
  }
};

// Get All Donations (with optional filters: kind & location)
// exports.getAllDonations = async (req, res) => {
//   try {
//     const { kind, location } = req.query;
//     const filter = {};
//     if (kind) filter.kind = kind.toLowerCase();
//     if (location) filter.location = location.toLowerCase();

//     const donations = await Donation.find(filter).populate("user", "name");
//     res.json(donations);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to fetch donations: " + err.message });
//   }
// };


exports.getAllDonations = async (req, res) => {
  try {
    const allDonations = await Donation.find({ isVisible: true }).populate("user");

    if (!req.user) return res.json(allDonations);

    const activities = await UserActivity.find({ user: req.user._id });

    const kindCount = {};
    const locationCount = {};
    activities.forEach((act) => {
      kindCount[act.kind] = (kindCount[act.kind] || 0) + 1;
      locationCount[act.location] = (locationCount[act.location] || 0) + 1;
    });

    const topKind = Object.entries(kindCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topLocation = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    const ranked = allDonations
      .map((donation) => {
        const kindScore = donation.kind === topKind ? 1 : 0;
        const locationScore = donation.location === topLocation ? 1 : 0;
        const totalScore = kindScore * 2 + locationScore; // الوزن ممكن تعديله
        return { donation, totalScore };
      })
    .sort((a, b) =>
  b.totalScore - a.totalScore ||
  new Date(b.donation.createdAt) - new Date(a.donation.createdAt)
)

      .map((item) => item.donation);

    res.json(ranked);
  } catch (err) {
    console.error("❌ Error in getAllDonations:", err.message);
    res.status(500).json({ message: "Server error while fetching donations" });
  }
};



// Get Donations By User
exports.getDonationsByUser = async (req, res) => {
  console.log("🔥 getDonationsByUser controller HIT");

  try {
    console.log("🔍 Fetching donations for user:", req.user._id);

    const donations = await Donation.find({ user: req.user._id }).populate(
      "user",
      "name"
    );
    console.log("✅ Donations fetched:", donations.length);

    res.json(donations);
  } catch (err) {
    console.error("❌ Failed to fetch donations:", err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ تحقق من صلاحية الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation ID" });
    }

    const donation = await Donation.findById(id).populate("user", "name");
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // ✅ لا تسجل النشاط إلا إذا كان المستخدم مسجّل دخول
    if (req.user && req.user._id) {
      try {
        await UserActivity.create({
          user: req.user._id,
          donation: donation._id,
          action: "view",
        });
      } catch (logErr) {
        console.warn("⚠️ Failed to log activity:", logErr.message);
      }
    }

    res.json(donation);
  } catch (err) {
    console.error("❌ Failed to fetch donation:", err.stack);
    res.status(500).json({ message: "Failed to fetch donation" });
  }
};



// Update Donation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // فقط صاحب التبرع يمكنه التعديل
    if (donation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const {
      title,
      kind,
      location,
      description,
      condition,
      expirationDate,
      existingImages,
    } = req.body;
    donation.title = title;
    donation.kind = kind;
    donation.location = location;
    donation.description = description;
    donation.condition = condition;
    donation.expirationDate = expirationDate;
    const keptImages = JSON.parse(existingImages || "[]");
    // أضف الصور الجديدة
    const uploadedImages = req.files
      ? req.files.map((file) => file.filename)
      : [];
    donation.images = [...keptImages, ...uploadedImages];
    await donation.save();
    res.json(donation);
  } catch (err) {
    console.error("❌ Error updating donation:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // فقط المستخدم الذي أنشأ التبرع يمكنه تعديله
    if (donation.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this donation" });
    }
    // الحالة الجديدة تأتي من body
    const { isValid } = req.body;
    donation.isValid = isValid;
    await donation.save();
    res.json({ message: "Status updated successfully", donation });
  } catch (err) {
    console.error("❌ Error updating donation:", err.stack);
    res.status(500).json({ message: "Failed to update status" });
  }
};

exports.getSimilarDonations = async (req, res) => {
  console.log("🔥🔥🔥 getSimilarDonations HIT", req.query);
  try {
    const { kind, excludeId } = req.query;

    if (!kind || !excludeId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // تحويل excludeId إلى ObjectId بشكل صحيح
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    const donations = await Donation.find({
      kind,
      _id: { $ne: excludeObjectId },
    }).limit(6);

    res.json(donations);
  } catch (err) {
    console.error("❌ Similar Donation Error:", err); // تأكد من الطباعة
    res.status(500).json({ message: "Failed to fetch donation" });
  }
};

// Delete Donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // ✅ Check ownership
    if (donation.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Not your donation" });
    }

    await donation.deleteOne();
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed: " + err.message });
  }
};
exports.getDonationsByUserId = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.params.id }).populate(
      "user",
      "name"
    );
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// exports.addInteraction = async (req, res) => {
//   try {
//     await Donation.findByIdAndUpdate(req.params.id, {
//       $inc: { interactions: 1 },
//     });
//     res.sendStatus(200);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to record interaction" });
//   }
// };

exports.addInteraction = async (req, res) => {
  const donationId = req.params.id;
  const { action } = req.body;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    await UserActivity.create({
      user: req.user._id,
      kind: donation.kind,
      location: donation.location,
      action: action || "view", // الافتراضي: عرض
    });

    // اختياري: زيادة العدّاد
    await Donation.findByIdAndUpdate(donationId, { $inc: { interactions: 1 } });

    res.status(200).json({ message: "Interaction recorded" });
  } catch (err) {
    console.error("❌ Error in addInteraction:", err.message);
    res.status(500).json({ message: "Failed to record interaction" });
  }
};


exports.getMostInterested = async (req, res) => {
  console.log("🚀 Called GET /most-interested");
  try {
    const top = await Donation.aggregate([
      { $match: { interactions: { $gt: 0 } } },
      { $sort: { interactions: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          title: 1,
          description: 1,
          kind: 1,
          location: 1,
          images: 1,
          condition: 1,
          createdAt: 1,
          interactions: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
          },
        },
      },
    ]);

    res.json(top);
  } catch (err) {
    console.error("❌ Error in getMostInterested:", err);
    res.status(500).json({ message: "Server error in getMostInterested" });
  }
};
