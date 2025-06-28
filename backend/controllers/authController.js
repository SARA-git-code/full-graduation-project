const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Register
exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, phone, location, showPhone } = req.body;

  if (!name || !email || !password || !confirmPassword || !phone || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      showPhone,
      isVerified: false,
      verificationCode: code,
    });

    // ✅ هنا نضيف كود إرسال البريد بعد إنشاء المستخدم مباشرة
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Give & Gather" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your verification code",
      html: `<h2>Welcome to Give & Gather!</h2>
             <p>Use the following code to verify your email:</p>
             <h1>${code}</h1>`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
      },
    });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
   console.log("🔐 Login attempt received");
  console.log("📧 Email provided:", email);
  console.log("🔑 Password provided:", password);
  try {
    console.log("📥 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password incorrect");
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      console.log("⚠️ User is not verified");
  return res.status(401).json({ message: "Please verify your email first." });
}

    if (user.isBanned) {
      console.log("⛔ User is banned");
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const { password: pwd, ...userData } = user.toObject();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ← اجعله دائمًا false في بيئة التطوير
      sameSite: "Lax", // ← أفضل من Strict لتسمح بإرسال الكوكي من React إلى Express
      maxAge: 2 * 60 * 60 * 1000,
    });

    console.log("✅ Login success:", user.email);
    res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("🔥 Server error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token"); // حذف الكوكي
  res.json({ message: "Logged out successfully" });
};






exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.verificationCode !== code) {
    return res.status(400).json({ message: "Incorrect code" });
  }

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();

  // ❗️ اجلب المستخدم من جديد بعد الحفظ
  const updatedUser = await User.findById(user._id);

  const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    token,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      location: updatedUser.location,
      isVerified: updatedUser.isVerified, // ✅ مهم جدًا
      // أضف أي خصائص أخرى تحتاجها هنا
    },
  });
};

