const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');

// @desc    List complaints with search/filter/sort/pagination
// @route   GET /api/complaints?search=&status=&priority=&agent=&category=&sort=&page=&limit=
// @access  Private
const getComplaints = asyncHandler(async (req, res) => {
  const { search, status, priority, agent, category, customer, sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (agent) query.assignedAgent = agent;
  if (customer) query.customer = customer;
  if (search) {
    query.$or = [
      { complaintId: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('customer', 'name phone email')
      .populate('assignedAgent', 'name email')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Complaint.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: complaints,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
  });
});

// @desc    Get single complaint with full timeline
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('customer', 'name phone email')
    .populate('assignedAgent', 'name email')
    .populate('timeline.updatedBy', 'name');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  res.json({ success: true, data: complaint });
});

// @desc    Register a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.create({
    ...req.body,
    createdBy: req.user._id,
    timeline: [{ status: 'Pending', note: 'Complaint registered', updatedBy: req.user._id }],
  });
  res.status(201).json({ success: true, data: complaint });
});

// @desc    Update a complaint (status/priority/agent/etc.) - appends to timeline on status change
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const { status, timelineNote, ...rest } = req.body;

  Object.assign(complaint, rest);

  if (status && status !== complaint.status) {
    complaint.status = status;
    complaint.timeline.push({ status, note: timelineNote || `Status changed to ${status}`, updatedBy: req.user._id });
    if (status === 'Resolved' || status === 'Closed') {
      complaint.resolvedAt = new Date();
    }
  }

  await complaint.save();
  res.json({ success: true, data: complaint });
});

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint deleted' });
});

module.exports = { getComplaints, getComplaintById, createComplaint, updateComplaint, deleteComplaint };
