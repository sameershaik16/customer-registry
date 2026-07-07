const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    List users (optionally filter by role) - used to populate agent assignment dropdowns
// @route   GET /api/users?role=agent
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const query = {};
  if (role) query.role = role;
  const users = await User.find(query).select('name email role isActive').sort({ name: 1 });
  res.json({ success: true, data: users });
});

module.exports = { getUsers };
