import { create } from 'zustand';
import api from '../lib/api.js';

export const useAuthStore = create((set) => ({
  jurist: null,
  token: localStorage.getItem('jn_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('jn_token', data.token);
    set({ token: data.token, jurist: data.jurist, loading: false });
    return data;
  },

  register: async (formData) => {
    set({ loading: true });
    const data = await api.post('/auth/register', formData);
    localStorage.setItem('jn_token', data.token);
    set({ token: data.token, jurist: data.jurist, loading: false });
    return data;
  },

  fetchMe: async () => {
    try {
      const data = await api.get('/auth/me');
      set({ jurist: data.jurist });
    } catch {
      set({ jurist: null, token: null });
      localStorage.removeItem('jn_token');
    }
  },

  logout: () => {
    localStorage.removeItem('jn_token');
    set({ jurist: null, token: null });
  },
}));
