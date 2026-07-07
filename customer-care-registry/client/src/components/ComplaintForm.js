import React, { useEffect, useState } from 'react';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from '../utils/constants';
import { getUsers } from '../services/userService';
import CustomerSelect from './CustomerSelect';

const emptyForm = {
  customer: '',
  subject: '',
  description: '',
  category: 'Other',
  priority: 'Medium',
  status: 'Pending',
  assignedAgent: '',
};

const ComplaintForm = ({ initialValues, onSubmit, onCancel, submitting, isEdit }) => {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await getUsers({ role: 'agent' });
      setAgents(data.data);
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Customer *</label>
        {isEdit ? (
          <input className="form-control" value={initialValues.customerLabel || ''} disabled />
        ) : (
          <CustomerSelect value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} required />
        )}
      </div>
      <div className="form-group">
        <label>Subject *</label>
        <input name="subject" className="form-control" value={form.subject} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description *</label>
        <textarea name="description" className="form-control" value={form.description} onChange={handleChange} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Category</label>
          <select name="category" className="form-control" value={form.category} onChange={handleChange}>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" className="form-control" value={form.priority} onChange={handleChange}>
            {COMPLAINT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {isEdit && (
          <div className="form-group">
            <label>Status</label>
            <select name="status" className="form-control" value={form.status} onChange={handleChange}>
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Assign Agent</label>
          <select name="assignedAgent" className="form-control" value={form.assignedAgent || ''} onChange={handleChange}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>
      {isEdit && (
        <div className="form-group">
          <label>Timeline Note (optional, added if status changes)</label>
          <input name="timelineNote" className="form-control" value={form.timelineNote || ''} onChange={handleChange} placeholder="e.g. Called customer to confirm resolution" />
        </div>
      )}
      <div className="modal-footer" style={{ padding: 0, borderTop: 'none', marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Complaint'}
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;
