const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User"); // تأكد أن المسار صحيح

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/giveAndGather", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  const email = "alaa.aleswed03@gmail.com"; // ← غيّر هذا لإيميل المستخدم
  const user = await User.findOne({ email });

  if (!user) {
    console.log("❌ User not found");
    process.exit();
  }

  user.role = "admin";
  await user.save();

  console.log(`✅ User "${user.name}" has been granted admin role`);
  process.exit();
})
.catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});
