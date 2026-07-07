import api from './api';

export const getInteractionsByCustomer = (customerId) => api.get(`/interactions/customer/${customerId}`);
export const createInteraction = (data) => api.post('/interactions', data);
export const deleteInteraction = (id) => api.delete(`/interactions/${id}`);
