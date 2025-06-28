const Conversation = require("../models/Conversation");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");
const Donation = require("../models/Donation");


// 📌 إنشاء محادثة جماعية
exports.createGroupConversation = async (req, res) => {
  const { groupName, users } = req.body;

  if (!groupName || !Array.isArray(users) || users.length < 2) {
    return res.status(400).json({
      message: "Group must have a name and at least 2 members",
    });
  }

  if (!users.includes(req.user._id.toString())) {
    users.push(req.user._id);
  }

  try {
    const group = await Conversation.create({
      users,
      isGroup: true,
      groupName,
      admin: req.user._id,
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("❌ Error creating group:", err.message);
    res.status(500).json({ message: "Server error while creating group" });
  }
};

// ✅ جلب كل المحادثات الثنائية فقط
exports.getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      users: userId,
      isGroup: false,
    })
      .populate("users", "name profileImage email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err) {
    console.error("❌ Error fetching conversations:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching conversations" });
  }
};

// ✅ server/controllers/conversationController.js
exports.getOrCreateConversation = async (req, res) => {
  const { userId,donationId } = req.params;
  if (!userId) return res.status(400).json({ message: "User ID is required" });
  try {
    // ابحث عن المحادثة
    let conversation = await Conversation.findOne({
      users: { $all: [req.user._id, userId], $size: 2 },
      isGroup: false,
    })
      .populate("users", "name profileImage email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name",
        },
      });
    // إذا كانت موجودة، أرجعها
    if (conversation) return res.status(200).json(conversation);
    // إذا غير موجودة، أنشئ واحدة
    conversation = await Conversation.create({
      users: [req.user._id, userId],
      isGroup: false,
    });
    // أعد تحميل المحادثة مع البيانات المطلوبة
    const fullConversation = await Conversation.findById(conversation._id)
      .populate("users", "name profileImage email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name",
        },
      });
    try {
      const donation = await Donation.findById(donationId); // تأكد أن عندك donationId
      if (donation) {
        await UserActivity.create({
          user: req.user._id,
          kind: donation.kind,
          location: donation.location,
          action: "contact",
        });
      }
    } catch (err) {
      console.error("❌ Failed to record contact activity:", err.message);
    }
    res.status(201).json(fullConversation);
  } catch (err) {
    console.error("❌ Error in getOrCreateConversation:", err.message);
    res.status(500).json({ message: "Failed to create or fetch conversation" });
  }
};

// 📌 جلب المحادثات الجماعية فقط
exports.getGroupConversations = async (req, res) => {
  try {
    const groups = await Conversation.find({
      isGroup: true,
      users: req.user._id,
    })
      .populate("users", "name profileImage")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (err) {
    console.error("❌ Error fetching group conversations:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching group conversations" });
  }
};
