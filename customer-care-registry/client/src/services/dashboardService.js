import api from './api';

export const getStats = () => api.get('/dashboard/stats');
export const getRecentActivity = () => api.get('/dashboard/recent-activity');
export const getTrends = () => api.get('/dashboard/trends');
