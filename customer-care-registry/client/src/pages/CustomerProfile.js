import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import InteractionForm from '../components/InteractionForm';
import StarRating from '../components/StarRating';
import { getCustomerById } from '../services/customerService';
import { createInteraction } from '../services/interactionService';
import { badgeClassForStatus, badgeClassForPriority, formatDateTime, initials } from '../utils/formatters';

const TABS = ['Complaints', 'Interactions', 'Feedback'];

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Complaints');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await getCustomerById(id);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogInteraction = async (form) => {
    setSubmitting(true);
    try {
      await createInteraction({ ...form, customer: id });
      toast.success('Interaction logged');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log interaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return <p className="empty-state">Customer not found</p>;

  const { customer, complaints, interactions, feedback } = data;

  return (
    <div>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/customers')}>
        <FiArrowLeft /> Back to Customers
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="user-avatar" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>
            {initials(customer.name)}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: '0 0 4px' }}>{customer.name}</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <span><FiPhone /> {customer.phone}</span>
              {customer.email && <span><FiMail /> {customer.email}</span>}
              {customer.address && <span><FiMapPin /> {customer.address}</span>}
            </div>
          </div>
          <span className={`badge badge-${customer.status}`}>{customer.status}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{interactions.length}</div>
          <div className="stat-label">Interactions Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{feedback.length}</div>
          <div className="stat-label">Feedback Submitted</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'Complaints' && (
            <>
              {complaints.length === 0 ? (
                <p className="empty-state">No complaints recorded for this customer</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Agent</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <Link to={`/complaints/${c._id}`}>{c.complaintId}</Link>
                          </td>
                          <td className="wrap">{c.subject}</td>
                          <td><span className={badgeClassForPriority(c.priority)}>{c.priority}</span></td>
                          <td><span className={badgeClassForStatus(c.status)}>{c.status}</span></td>
                          <td>{c.assignedAgent?.name || 'Unassigned'}</td>
                          <td>{formatDateTime(c.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === 'Interactions' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                  <FiPlus /> Log Interaction
                </button>
              </div>
              {interactions.length === 0 ? (
                <p className="empty-state">No interactions logged yet</p>
              ) : (
                <div className="timeline">
                  {interactions.map((i) => (
                    <div className="timeline-item" key={i._id}>
                      <div className="t-status">{i.type}</div>
                      <div className="t-note">{i.summary}</div>
                      <div className="t-meta">
                        {formatDateTime(i.occurredAt)} · Logged by {i.handledBy?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'Feedback' && (
            <>
              {feedback.length === 0 ? (
                <p className="empty-state">No feedback submitted yet</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rating</th>
                        <th>Comments</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((f) => (
                        <tr key={f._id}>
                          <td><StarRating value={f.rating} /></td>
                          <td className="wrap">{f.comments || '-'}</td>
                          <td>{formatDateTime(f.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal title="Log Interaction" onClose={() => setModalOpen(false)}>
          <InteractionForm onSubmit={handleLogInteraction} onCancel={() => setModalOpen(false)} submitting={submitting} />
        </Modal>
      )}
    </div>
  );
};

export default CustomerProfile;
