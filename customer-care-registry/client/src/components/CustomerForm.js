import React, { useState } from 'react';
import { CUSTOMER_STATUSES } from '../utils/constants';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  gender: 'unspecified',
  status: 'active',
  notes: '',
};

const CustomerForm = ({ initialValues, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
            <option value="unspecified">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" className="form-control" value={form.status} onChange={handleChange}>
            {CUSTOMER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Address</label>
        <input name="address" className="form-control" value={form.address} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} />
      </div>
      <div className="modal-footer" style={{ padding: 0, borderTop: 'none', marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
