const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }, // optional link to a specific complaint
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, trim: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
