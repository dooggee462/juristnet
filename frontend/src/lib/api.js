import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('em_token') || localStorage.getItem('jn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('em_token');
      localStorage.removeItem('jn_token');
      window.location.href = '/expert/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
