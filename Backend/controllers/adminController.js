// controllers/adminController.js
const User = require('../models/User');

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= BLOCK / UNBLOCK USER ================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      message: `User ${user.isVerified ? 'activated' : 'blocked'} successfully`
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
