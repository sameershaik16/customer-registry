import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ComplaintForm from '../components/ComplaintForm';
import { getComplaintById, updateComplaint } from '../services/complaintService';
import { badgeClassForStatus, badgeClassForPriority, formatDateTime } from '../utils/formatters';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getComplaintById(id);
      setComplaint(data.data);
    } catch (err) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assignedAgent) payload.assignedAgent = null;
      await updateComplaint(id, payload);
      toast.success('Complaint updated');
      setModalOpen(false);
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!complaint) return <p className="empty-state">Complaint not found</p>;

  return (
    <div>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/complaints')}>
        <FiArrowLeft /> Back to Complaints
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <h3>{complaint.complaintId} — {complaint.subject}</h3>
            <p className="page-subtitle" style={{ marginTop: 4 }}>
              Filed by <Link to={`/customers/${complaint.customer?._id}`}>{complaint.customer?.name}</Link> on {formatDateTime(complaint.createdAt)}
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(true)}>
            <FiEdit2 /> Edit
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className={badgeClassForStatus(complaint.status)}>{complaint.status}</span>
            <span className={badgeClassForPriority(complaint.priority)}>{complaint.priority}</span>
            <span className="badge badge-inprogress">{complaint.category}</span>
          </div>
          <p style={{ marginTop: 0 }}>{complaint.description}</p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 16, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <div><strong style={{ color: 'var(--color-text)' }}>Assigned Agent:</strong> {complaint.assignedAgent?.name || 'Unassigned'}</div>
            <div><strong style={{ color: 'var(--color-text)' }}>Customer Phone:</strong> {complaint.customer?.phone}</div>
            {complaint.resolvedAt && (
              <div><strong style={{ color: 'var(--color-text)' }}>Resolved On:</strong> {formatDateTime(complaint.resolvedAt)}</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Status Timeline</h3>
        </div>
        <div className="card-body">
          <div className="timeline">
            {complaint.timeline.slice().reverse().map((t, i) => (
              <div className="timeline-item" key={i}>
                <div className="t-status">{t.status}</div>
                {t.note && <div className="t-note">{t.note}</div>}
                <div className="t-meta">{formatDateTime(t.updatedAt)} · {t.updatedBy?.name || 'System'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Edit Complaint" onClose={() => setModalOpen(false)}>
          <ComplaintForm
            isEdit
            initialValues={{
              ...complaint,
              customerLabel: `${complaint.customer?.name} — ${complaint.customer?.phone}`,
              assignedAgent: complaint.assignedAgent?._id || '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => setModalOpen(false)}
            submitting={submitting}
          />
        </Modal>
      )}
    </div>
  );
};

export default ComplaintDetail;
