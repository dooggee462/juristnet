import { create } from 'zustand';
import api from '../lib/api.js';

export const useAuthStore = create((set) => ({
  expert: null,
  token: localStorage.getItem('em_token') || localStorage.getItem('jn_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('em_token', data.token);
    localStorage.removeItem('jn_token');
    set({ token: data.token, expert: data.expert, loading: false });
    return data;
  },

  register: async (formData) => {
    set({ loading: true });
    const data = await api.post('/auth/register', formData);
    localStorage.setItem('em_token', data.token);
    localStorage.removeItem('jn_token');
    set({ token: data.token, expert: data.expert, loading: false });
    return data;
  },

  fetchMe: async () => {
    try {
      const data = await api.get('/auth/me');
      set({ expert: data.expert });
    } catch {
      set({ expert: null, token: null });
      localStorage.removeItem('em_token');
      localStorage.removeItem('jn_token');
    }
  },

  logout: () => {
    localStorage.removeItem('em_token');
    localStorage.removeItem('jn_token');
    set({ expert: null, token: null });
  },
}));
