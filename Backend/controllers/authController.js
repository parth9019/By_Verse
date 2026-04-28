// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const { sendOtpEmail } = require('../utils/mailer');

/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,

      // 🔥 TEMPORARY: Directly verify user (OTP disabled mode)
      isVerified: true,
    });

    /*
    // Welcome email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to ShopKart 🎉',
        html: `
          <div style="font-family: Arial; padding:20px;">
            <h2>Welcome, ${user.name} 👋</h2>
            <p>Your account has been created successfully.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Register email failed:', err.message);
    }

    // Remove old OTPs
    await Otp.deleteMany({ email });

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, code, expiresAt, used: false });

    // Send OTP email
    try {
      await sendOtpEmail(email, code);
    } catch (err) {
      console.error('OTP email failed:', err.message);
    }
    */

    res.status(201).json({
      message: 'Registration successful. You can now login.',
      email,
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= SEND OTP ================= */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    /*
    if (!email) return res.status(400).json({ message: 'Email required' });

    await Otp.deleteMany({ email });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, code, expiresAt, used: false });
    await sendOtpEmail(email, code);

    res.json({ message: 'OTP sent successfully' });
    */

    res.json({ message: 'OTP feature temporarily disabled' });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
  try {

    /*
    const { email, code } = req.body;

    const otp = await Otp.findOne({ email, code, used: false }).sort({
      createdAt: -1,
    });

    if (!otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    otp.used = true;
    await otp.save();

    await User.updateOne({ email }, { isVerified: true });

    res.json({ message: 'OTP verified successfully. Please login.' });
    */

    res.json({ message: 'OTP verification temporarily disabled' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔥 OTP check disabled
    /*
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: 'Please verify your email first' });
    }
    */

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // 🔥 NEW: Master Audit Trail for Logins
    try {
      await AuditLog.create({
        action: user.role === 'seller' ? 'SELLER_LOGIN' : user.role === 'admin' ? 'ADMIN_LOGIN' : 'USER_LOGIN',
        performedBy: user._id,
        target: 'System',
        description: `Successful remote authentication.`
      });
    } catch (auditErr) {
      console.error('Audit trap failed:', auditErr);
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= LOGOUT ================= */
const logout = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.create({
        action: req.user.role === 'seller' ? 'SELLER_LOGOUT' : req.user.role === 'admin' ? 'ADMIN_LOGOUT' : 'USER_LOGOUT',
        performedBy: req.user._id,
        target: 'System',
        description: `Manual session termination.`
      });
    }
    res.status(200).json({ message: 'Session terminated' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= CHANGE PASSWORD ================= */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password successfully updated' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error. Failed to update password.' });
  }
};

/* ================= EXPORTS ================= */
module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyOtp,
  changePassword
};
