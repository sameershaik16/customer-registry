import React, { useState } from 'react';
import { INTERACTION_TYPES } from '../utils/constants';

const InteractionForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ type: 'Call', summary: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Interaction Type</label>
        <select name="type" className="form-control" value={form.type} onChange={handleChange}>
          {INTERACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Summary *</label>
        <textarea
          name="summary"
          className="form-control"
          placeholder="What was discussed or noted?"
          value={form.summary}
          onChange={handleChange}
          required
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, borderTop: 'none', marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Log Interaction'}
        </button>
      </div>
    </form>
  );
};

export default InteractionForm;
