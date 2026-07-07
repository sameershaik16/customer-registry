import api from './api';

export const getUsers = (params) => api.get('/users', { params });
