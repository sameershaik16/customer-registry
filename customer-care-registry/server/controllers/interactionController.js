const asyncHandler = require('express-async-handler');
const InteractionHistory = require('../models/InteractionHistory');

// @desc    Get interaction history for a specific customer
// @route   GET /api/interactions/customer/:customerId
// @access  Private
const getInteractionsByCustomer = asyncHandler(async (req, res) => {
  const interactions = await InteractionHistory.find({ customer: req.params.customerId })
    .populate('handledBy', 'name')
    .sort({ occurredAt: -1 });
  res.json({ success: true, data: interactions });
});

// @desc    Log a new customer interaction
// @route   POST /api/interactions
// @access  Private
const createInteraction = asyncHandler(async (req, res) => {
  const interaction = await InteractionHistory.create({ ...req.body, handledBy: req.user._id });
  res.status(201).json({ success: true, data: interaction });
});

// @desc    Delete an interaction record
// @route   DELETE /api/interactions/:id
// @access  Private/Admin
const deleteInteraction = asyncHandler(async (req, res) => {
  const interaction = await InteractionHistory.findById(req.params.id);
  if (!interaction) {
    res.status(404);
    throw new Error('Interaction not found');
  }
  await interaction.deleteOne();
  res.json({ success: true, message: 'Interaction deleted' });
});

module.exports = { getInteractionsByCustomer, createInteraction, deleteInteraction };
