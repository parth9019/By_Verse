const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true only for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (to, code) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${code}</h2><p>Valid for 5 minutes</p>`,
  });
};

module.exports = { sendOtpEmail };
