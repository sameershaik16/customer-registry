import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { getStats, getTrends } from '../services/dashboardService';
import { getFeedbackReport } from '../services/feedbackService';
import { getComplaints } from '../services/complaintService';
import { CHART_COLORS } from '../utils/constants';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { formatDate } from '../utils/formatters';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, trendsRes, feedbackRes, complaintsRes] = await Promise.all([
          getStats(),
          getTrends(),
          getFeedbackReport(),
          getComplaints({ limit: 500, sort: '-createdAt' }),
        ]);
        setStats(statsRes.data.data);
        setTrends(trendsRes.data.data);
        setFeedbackReport(feedbackRes.data.data);
        setComplaints(complaintsRes.data.data);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCSV = () => {
    const rows = complaints.map((c) => ({
      ComplaintID: c.complaintId,
      Customer: c.customer?.name,
      Subject: c.subject,
      Category: c.category,
      Priority: c.priority,
      Status: c.status,
      Agent: c.assignedAgent?.name || 'Unassigned',
      DateFiled: formatDate(c.createdAt),
    }));
    exportToCSV(rows, 'complaints_report.csv');
    toast.success('CSV report downloaded');
  };

  const handleExportPDF = () => {
    const columns = ['ID', 'Customer', 'Subject', 'Priority', 'Status', 'Agent', 'Date'];
    const rows = complaints
      .slice(0, 200)
      .map((c) => [c.complaintId, c.customer?.name, c.subject, c.priority, c.status, c.assignedAgent?.name || 'Unassigned', formatDate(c.createdAt)]);
    exportToPDF('Complaints Report', columns, rows, 'complaints_report.pdf');
    toast.success('PDF report downloaded');
  };

  if (loading) return <Loader />;

  const categoryData = trends.categoryBreakdown.map((c) => ({ name: c._id, count: c.count }));
  const priorityData = trends.priorityBreakdown.map((p) => ({ name: p._id, value: p.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="page-subtitle">Insights into complaint volume, resolution, and customer satisfaction</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FiDownload /> Export CSV
          </button>
          <button className="btn btn-outline" onClick={handleExportPDF}>
            <FiFileText /> Export PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="%" label="Resolution Rate" value={`${stats.resolutionRate}%`} color="#2fa38c" />
        <StatCard icon="★" label="Avg. Satisfaction" value={`${feedbackReport.averageRating} / 5`} color="#e0a83e" />
        <StatCard icon="!" label="Open Cases" value={stats.openCases} color="#d9534f" />
        <StatCard icon="✓" label="Closed Cases" value={stats.closedCases} color="#2f5d8a" />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3>Complaints by Category</h3></div>
          <div className="card-body">
            {categoryData.length === 0 ? (
              <p className="empty-state">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2f5d8a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Priority Distribution</h3></div>
          <div className="card-body">
            {priorityData.length === 0 ? (
              <p className="empty-state">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={90}>
                    {priorityData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Feedback Rating Breakdown</h3></div>
        <div className="card-body">
          {feedbackReport.ratingBreakdown.length === 0 ? (
            <p className="empty-state">No feedback yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feedbackReport.ratingBreakdown.map((r) => ({ rating: `${r._id} star`, count: r.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
                <XAxis dataKey="rating" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#e0a83e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
