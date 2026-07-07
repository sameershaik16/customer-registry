const mongoose = require('mongoose');

const interactionHistorySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }, // optional link
    type: { type: String, enum: ['Call', 'Email', 'Meeting', 'Note'], required: true },
    summary: { type: String, required: [true, 'Summary is required'], trim: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InteractionHistory', interactionHistorySchema);
