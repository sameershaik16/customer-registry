import React, { useState } from 'react';
import CustomerSelect from './CustomerSelect';
import StarRating from './StarRating';

const FeedbackForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ customer: '', rating: 5, comments: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Customer *</label>
        <CustomerSelect value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} required />
      </div>
      <div className="form-group">
        <label>Rating *</label>
        <StarRating value={form.rating} interactive size={24} onChange={(v) => setForm({ ...form, rating: v })} />
      </div>
      <div className="form-group">
        <label>Comments</label>
        <textarea
          className="form-control"
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          placeholder="What did the customer say?"
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, borderTop: 'none', marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
