import React, { useEffect, useState } from 'react';
import {
  FiUsers,
  FiAlertCircle,
  FiFolder,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { toast } from 'react-toastify';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { getStats, getRecentActivity, getTrends } from '../services/dashboardService';
import { timeAgo } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [trends, setTrends] = useState({ monthlyTrend: [], categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes, trendsRes] = await Promise.all([
          getStats(),
          getRecentActivity(),
          getTrends(),
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
        setTrends(trendsRes.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const trendData = trends.monthlyTrend.map((t) => ({
    month: `${MONTH_NAMES[t._id.month - 1]}`,
    complaints: t.count,
  }));

  const categoryData = trends.categoryBreakdown.map((c) => ({ name: c._id, value: c.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p className="page-subtitle">A snapshot of customer care activity across the organization</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<FiUsers />} label="Total Customers" value={stats.totalCustomers} color="#2f5d8a" />
        <StatCard icon={<FiAlertCircle />} label="Total Complaints" value={stats.totalComplaints} color="#e0a83e" />
        <StatCard icon={<FiFolder />} label="Open Cases" value={stats.openCases} color="#d9534f" />
        <StatCard icon={<FiCheckCircle />} label="Closed Cases" value={stats.closedCases} color="#2fa38c" />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3>Monthly Complaint Trend</h3>
          </div>
          <div className="card-body">
            {trendData.length === 0 ? (
              <p className="empty-state">Not enough data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="#2f5d8a" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Complaints by Category</h3>
          </div>
          <div className="card-body">
            {categoryData.length === 0 ? (
              <p className="empty-state">Not enough data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                    {categoryData.map((entry, i) => (
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
        <div className="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="card-body">
          {activity.length === 0 ? (
            <p className="empty-state">No recent activity</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activity.map((a, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span>{a.message}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {timeAgo(a.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
