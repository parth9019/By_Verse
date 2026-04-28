// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
};

module.exports = { sendEmail };
