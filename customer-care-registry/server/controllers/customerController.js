const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Complaint = require('../models/Complaint');
const InteractionHistory = require('../models/InteractionHistory');
const Feedback = require('../models/Feedback');

// @desc    List customers with search, filter & pagination
// @route   GET /api/customers?search=&status=&page=&limit=
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Customer.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: customers,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
  });
});

// @desc    Get a single customer plus a quick summary of related records
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const [complaints, interactions, feedback] = await Promise.all([
    Complaint.find({ customer: customer._id }).sort({ createdAt: -1 }).populate('assignedAgent', 'name'),
    InteractionHistory.find({ customer: customer._id }).sort({ occurredAt: -1 }).populate('handledBy', 'name'),
    Feedback.find({ customer: customer._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, data: { customer, complaints, interactions, feedback } });
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: customer });
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  res.json({ success: true, data: customer });
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  await customer.deleteOne();
  // Cascade-clean related records to keep the registry consistent
  await Promise.all([
    Complaint.deleteMany({ customer: customer._id }),
    InteractionHistory.deleteMany({ customer: customer._id }),
    Feedback.deleteMany({ customer: customer._id }),
  ]);
  res.json({ success: true, message: 'Customer and related records deleted' });
});

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
