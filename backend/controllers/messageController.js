const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Report = require("../models/Report");
const Block = require("../models/Block");
const Donation = require ("../models/Donation")
const path = require("path");
const mongoose = require("mongoose");

const axios = require("axios");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

exports.sendMessage = async (req, res) => {
  console.log("📥 Incoming message:", req.body);

  const { conversationId, content, location, replyTo } = req.body;
  let attachment = null;
  let type = req.body.type || "text";

  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });
  const receiverId = conversation.users.find(
    (userId) => userId.toString() !== req.user._id.toString()
  );

  if (!conversationId || (!content && !location && !req.file)) {
    return res.status(400).json({ message: "Missing required message data" });
  }

  try {
    if (req.file) {
      attachment = req.file.filename;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if ([".mp3", ".wav"].includes(ext)) type = "audio";
      else if ([".mp4", ".webm"].includes(ext)) type = "video";
      else if ([".pdf", ".docx", ".xlsx", ".zip", ".rar"].includes(ext))
        type = "file";
      else type = "image";
    }

    if (type === "location" && location?.lat && location?.lng) {
      if (location?.lat && location?.lng) {
        try {
          const geoRes = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
              params: {
                latlng: `${location.lat},${location.lng}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
              },
            }
          );
          const placeName = geoRes.data.results?.[0]?.formatted_address;
          if (placeName) {
            content = `📍 ${placeName}`;
          }
        } catch (err) {
          console.error("❌ Error fetching place name:", err.message);
        }
      }
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      type,
      attachment,
      location,
      replyTo,
      conversationId: new mongoose.Types.ObjectId(conversationId),
    });
    
    // ✅ زيادة التفاعل للتبرع المرتبط بالمحادثة (بعد إنشاء الرسالة)
    await Donation.findByIdAndUpdate(conversation.relatedDonation, {
      $inc: { interactions: 1 },
    });

    // ✅ تحديث آخر رسالة في المحادثة
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    // ✅ جلب الرسالة كاملة مع بيانات المرسل فقط
    const fullMessage = await Message.findById(message._id)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    res.status(201).json(fullMessage);
  } catch (err) {
    console.error("❌ Error sending message:", err.message);
    res.status(500).json({ message: "Server error while sending message" });
  }
};

/**
 * 📢 إرسال رسالة جماعية
 */
exports.sendGroupMessage = async (req, res) => {
  const { conversationId, content, location, replyTo } = req.body;
  let attachment = null;
  let type = req.body.type || "text";

  if (req.file) {
    attachment = req.file.filename;
    const ext = path.extname(req.file.originalname).toLowerCase();
    if ([".mp3", ".wav"].includes(ext)) type = "audio";
    else if ([".mp4", ".webm"].includes(ext)) type = "video";
    else if ([".pdf", ".docx", ".xlsx"].includes(ext)) type = "file";
    else type = "image";
  }

  if (!conversationId || (!content && !attachment && !location)) {
    return res.status(400).json({ message: "Missing required data" });
  }

  let conversation;
  try {
    conversation = await Conversation.findById(
      new mongoose.Types.ObjectId(conversationId)
    );
  } catch (err) {
    return res.status(400).json({ message: "Invalid conversationId format" });
  }

  if (!conversation || !conversation.isGroup) {
    return res.status(404).json({ message: "Group conversation not found" });
  }

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: null,
      content,
      type,
      attachment,
      location,
      replyTo,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json({ message, conversationId });
  } catch (err) {
    console.error("❌ Error sending group message:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 💬 جلب المحادثة مع مستخدم معيّن
 */
exports.getChatWithUser = async (req, res) => {
  const { otherUserId } = req.params;
  const myId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "name")
      .populate("replyTo");

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

/**
 * ✅ تحديث الرسائل إلى "مقروءة"
 */
exports.markMessagesAsRead = async (req, res) => {
  const { fromUserId } = req.body;

  try {
    await Message.updateMany(
      {
        sender: fromUserId,
        receiver: req.user._id,
        isSeen: false,
      },
      { isSeen: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("❌ Error marking messages as read:", err.message);
    res.status(500).json({ message: "Server error while marking as read" });
  }
};

/**
 * 📥 جلب قائمة المحادثات
 */
exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      users: req.user._id,
    })
      .populate("users", "name profileImage")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "name profileImage",
        },
      })
      .sort({ updatedAt: -1 });

    console.log("📨 Conversations with populated lastMessage:", conversations);

    res.json(conversations);
  } catch (err) {
    console.error("❌ Error fetching conversations:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching conversations" });
  }
};

/**
 * 🗑️ حذف رسالة
 */
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    message.deleted = true;
    message.content = "";
    message.attachment = null;
    await message.save();
    // ✅ إرسال إشعار عبر WebSocket
    const io = req.app.get("io");
    if (io) {
      io.emit("messageDeleted", {
        messageId: message._id.toString(),
        conversationId: message.conversationId.toString(),
      });
    }
    res.json({ message: "Message marked as deleted" });
  } catch (err) {
    console.error("❌ Error deleting message:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✏️ تعديل رسالة
 */
exports.editMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.content = content;
    await message.save();

    res.json({ message: "Message updated", updatedMessage: message });
  } catch (err) {
    console.error("❌ Error editing message:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      { content, edited: true },
      { new: true }
    ).populate("sender");

    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Edit failed" });
  }
};

/**
 * 🚩 تبليغ عن رسالة
 */
exports.reportMessage = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const report = await Report.create({
      message: id,
      reporter: req.user._id,
      reason,
    });

    res.status(201).json({ message: "Message reported successfully", report });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reported this message." });
    }

    console.error("❌ Error reporting message:", err.message);
    res.status(500).json({ message: "Server error while reporting message" });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name")
      .populate("receiver", "name");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(message);
  } catch (err) {
    console.error("❌ Error fetching message:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) // ترتيب تصاعدي (أقدم إلى أحدث)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error.message);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};
