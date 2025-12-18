import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const productAPI = {
    getAll: (searchQuery = '') => api.get('/products', { params: { search: searchQuery } }),
    getBySKU: (sku) => api.get(`/products/${sku}`),
    create: (data) => api.post('/products', data),
    update: (sku, data) => api.put(`/products/${sku}`, data),
    delete: (sku) => api.delete(`/products/${sku}`),
    uploadImage: (sku, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return api.post(`/products/${sku}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

export const salesAPI = {
    getToday: () => api.get('/sales/today'),
    getWeekly: () => api.get('/sales/weekly'),
    getMonthly: () => api.get('/sales/monthly'),
    getSummary: () => api.get('/sales/summary'),
};

export const transactionAPI = {
    create: (data) => api.post('/transactions', data),
    getAll: (params) => api.get('/transactions', { params }),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getProfitChart: () => api.get('/dashboard/profit-chart'),
};

export const debtAPI = {
    getAll: () => api.get('/debts'),
    getById: (id) => api.get(`/debts/${id}`),
    create: (data) => api.post('/debts', data),
    update: (id, data) => api.put(`/debts/${id}`, data),
    recordPayment: (id, data) => api.post(`/debts/${id}/payment`, data),
    delete: (id) => api.delete(`/debts/${id}`),
};

export const reportAPI = {
    generatePDF: (data) =>
        api.post('/reports/pdf', data, { responseType: 'blob' }),
    generateExcel: (data) =>
        api.post('/reports/excel', data, { responseType: 'blob' }),
};

export default api;
