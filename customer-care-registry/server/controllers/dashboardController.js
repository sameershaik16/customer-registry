const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');

// @desc    Card-level dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const [totalCustomers, totalComplaints, openCases, closedCases, avgRatingResult] = await Promise.all([
    Customer.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
    Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalCustomers,
      totalComplaints,
      openCases,
      closedCases,
      resolutionRate: totalComplaints ? Math.round((closedCases / totalComplaints) * 100) : 0,
      averageRating: Number(avgRatingResult[0]?.avg?.toFixed(2)) || 0,
    },
  });
});

// @desc    Recent activity feed (latest complaints, customers, feedback combined)
// @route   GET /api/dashboard/recent-activity
// @access  Private
const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentComplaints, recentCustomers, recentFeedback] = await Promise.all([
    Complaint.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name'),
    Customer.find().sort({ createdAt: -1 }).limit(5),
    Feedback.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name'),
  ]);

  const activity = [
    ...recentComplaints.map((c) => ({
      type: 'complaint',
      message: `New complaint "${c.subject}" from ${c.customer?.name || 'Unknown'}`,
      status: c.status,
      timestamp: c.createdAt,
    })),
    ...recentCustomers.map((c) => ({
      type: 'customer',
      message: `New customer registered: ${c.name}`,
      timestamp: c.createdAt,
    })),
    ...recentFeedback.map((f) => ({
      type: 'feedback',
      message: `${f.customer?.name || 'A customer'} rated ${f.rating} star(s)`,
      timestamp: f.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  res.json({ success: true, data: activity });
});

// @desc    Monthly complaint trend + category breakdown for charts
// @route   GET /api/dashboard/trends
// @access  Private
const getTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [monthlyTrend, categoryBreakdown, priorityBreakdown] = await Promise.all([
    Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
  ]);

  res.json({ success: true, data: { monthlyTrend, categoryBreakdown, priorityBreakdown } });
});

module.exports = { getStats, getRecentActivity, getTrends };
