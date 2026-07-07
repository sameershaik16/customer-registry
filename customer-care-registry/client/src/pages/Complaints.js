import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import ComplaintForm from '../components/ComplaintForm';
import { useAuth } from '../context/AuthContext';
import { getComplaints, createComplaint, deleteComplaint } from '../services/complaintService';
import { getUsers } from '../services/userService';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../utils/constants';
import { badgeClassForStatus, badgeClassForPriority, formatDate } from '../utils/formatters';

const Complaints = () => {
  const { isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [agent, setAgent] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getUsers({ role: 'agent' }).then(({ data }) => setAgents(data.data));
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getComplaints({ search, status, priority, agent, sort, page, limit: 10 });
      setComplaints(data.data);
      setPages(data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, agent, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 300);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assignedAgent) delete payload.assignedAgent;
      await createComplaint(payload);
      toast.success('Complaint registered');
      setModalOpen(false);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComplaint(deleteTarget._id);
      toast.success('Complaint deleted');
      setDeleteTarget(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p className="page-subtitle">Track, assign, and resolve customer complaints</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Register Complaint
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <FiSearch />
          <input
            placeholder="Search by ID, subject or description..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <select className="filter-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={priority} onChange={(e) => { setPage(1); setPriority(e.target.value); }}>
          <option value="">All Priorities</option>
          {COMPLAINT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={agent} onChange={(e) => { setPage(1); setAgent(e.target.value); }}>
          <option value="">All Agents</option>
          {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : complaints.length === 0 ? (
          <p className="empty-state">No complaints found</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>{c.complaintId}</td>
                    <td>{c.customer?.name || 'Unknown'}</td>
                    <td className="wrap">{c.subject}</td>
                    <td><span className={badgeClassForPriority(c.priority)}>{c.priority}</span></td>
                    <td><span className={badgeClassForStatus(c.status)}>{c.status}</span></td>
                    <td>{c.assignedAgent?.name || 'Unassigned'}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/complaints/${c._id}`} className="icon-btn" title="View">
                          <FiEye />
                        </Link>
                        {isAdmin && (
                          <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(c)}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>

      {modalOpen && (
        <Modal title="Register Complaint" onClose={() => setModalOpen(false)}>
          <ComplaintForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitting={submitting} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Complaint"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete complaint <strong>{deleteTarget.complaintId}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default Complaints;
