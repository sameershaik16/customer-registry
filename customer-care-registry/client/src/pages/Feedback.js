import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import FeedbackForm from '../components/FeedbackForm';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { getFeedback, createFeedback, deleteFeedback, getFeedbackReport } from '../services/feedbackService';
import { formatDate } from '../utils/formatters';

const Feedback = () => {
  const { isAdmin } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feedbackRes, reportRes] = await Promise.all([
        getFeedback({ page, limit: 10 }),
        getFeedbackReport(),
      ]);
      setFeedback(feedbackRes.data.data);
      setPages(feedbackRes.data.pagination.pages);
      setReport(reportRes.data.data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      await createFeedback(form);
      toast.success('Feedback submitted');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFeedback(deleteTarget._id);
      toast.success('Feedback deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete feedback');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Feedback</h1>
          <p className="page-subtitle">Customer satisfaction ratings and comments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Submit Feedback
        </button>
      </div>

      {report && (
        <div className="stats-grid">
          <StatCard icon={<FiStar />} label="Average Rating" value={`${report.averageRating} / 5`} color="#e0a83e" />
          <StatCard icon={<FiStar />} label="Total Feedback" value={report.totalFeedback} color="#2f5d8a" />
          <StatCard icon={<FiStar />} label="Satisfaction Rate" value={`${report.satisfactionRate}%`} color="#2fa38c" />
        </div>
      )}

      <div className="card">
        {loading ? (
          <Loader />
        ) : feedback.length === 0 ? (
          <p className="empty-state">No feedback submitted yet</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Related Complaint</th>
                  <th>Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f._id}>
                    <td>{f.customer?.name || 'Unknown'}</td>
                    <td><StarRating value={f.rating} /></td>
                    <td className="wrap">{f.comments || '-'}</td>
                    <td>{f.complaint?.complaintId || '-'}</td>
                    <td>{formatDate(f.createdAt)}</td>
                    {isAdmin && (
                      <td>
                        <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(f)}>
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>

      {modalOpen && (
        <Modal title="Submit Feedback" onClose={() => setModalOpen(false)}>
          <FeedbackForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} submitting={submitting} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Feedback"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this feedback entry? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default Feedback;
