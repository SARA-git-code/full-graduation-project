const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// دالة إرسال كود التحقق
const sendResetCode = async (to, code) => {
  await transporter.sendMail({
    from: `"Give & Gather" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Reset Your Password',
    html: `
      <h2>Reset Code</h2>
      <p>Your reset code is: <strong style="font-size:18px">${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  });
};

// دالة إرسال إيميل تأكيد تغيير كلمة المرور
const sendPasswordChangedEmail = async (to, name = '') => {
  await transporter.sendMail({
    from: `"Give & Gather" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Password Changed Successfully',
    html: `
      <h2>Password Changed</h2>
      <p>Hello ${name},</p>
      <p>Your password was successfully changed.</p>
      <p>If this wasn't you, please contact support immediately.</p>
    `
  });
};

module.exports = {
  sendResetCode,
  sendPasswordChangedEmail
};
