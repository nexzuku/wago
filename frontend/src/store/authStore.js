import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      set({
        user: data.data.user,
        company: data.data.company,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    set({
      user: data.data.user,
      company: data.data.company,
      isAuthenticated: true
    });

    return data.data;
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    set({
      user: data.data.user,
      company: data.data.company,
      isAuthenticated: true
    });

    return data.data;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    set({
      user: null,
      company: null,
      isAuthenticated: false
    });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates }
    }));
  },

  updateCompany: (updates) => {
    set((state) => ({
      company: { ...state.company, ...updates }
    }));
  },

  isAdmin: () => get().user?.role === 'admin',
  isManager: () => ['admin', 'manager'].includes(get().user?.role),
  isEmployee: () => get().user?.role === 'employee'
}));

export default useAuthStore;
