const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true, index: true }, // human-readable e.g. CMP-000123
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    category: {
      type: String,
      enum: ['Service Delay', 'Product Issue', 'Billing', 'Staff Behavior', 'Technical', 'Donation', 'Other'],
      default: 'Other',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Pending' },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

// Auto-generate a human friendly complaint ID before validation
complaintSchema.pre('validate', async function generateComplaintId(next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

complaintSchema.index({ subject: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
