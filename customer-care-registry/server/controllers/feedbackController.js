const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');

// @desc    List all feedback (optionally filter by customer)
// @route   GET /api/feedback?customer=&page=&limit=
// @access  Private
const getFeedback = asyncHandler(async (req, res) => {
  const { customer, page = 1, limit = 10 } = req.query;
  const query = {};
  if (customer) query.customer = customer;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [feedback, total] = await Promise.all([
    Feedback.find(query)
      .populate('customer', 'name')
      .populate('complaint', 'complaintId subject')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Feedback.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: feedback,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
  });
});

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({ ...req.body, submittedBy: req.user._id });
  res.status(201).json({ success: true, data: feedback });
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  await feedback.deleteOne();
  res.json({ success: true, message: 'Feedback deleted' });
});

// @desc    Aggregated feedback / CSAT report
// @route   GET /api/feedback/reports
// @access  Private
const getFeedbackReport = asyncHandler(async (req, res) => {
  const [ratingBreakdown, averageResult] = await Promise.all([
    Feedback.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }]),
  ]);

  const average = averageResult[0] || { avgRating: 0, total: 0 };
  const satisfied = ratingBreakdown
    .filter((r) => r._id >= 4)
    .reduce((sum, r) => sum + r.count, 0);
  const satisfactionRate = average.total ? Math.round((satisfied / average.total) * 100) : 0;

  res.json({
    success: true,
    data: {
      averageRating: Number(average.avgRating?.toFixed(2)) || 0,
      totalFeedback: average.total,
      satisfactionRate,
      ratingBreakdown,
    },
  });
});

module.exports = { getFeedback, createFeedback, deleteFeedback, getFeedbackReport };
