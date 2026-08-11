import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user:            null,
  isAuthenticated: false,
  isInitializing:  true,   // app start mein true — loading show karo

  setUser: (user) => set({
    user,
    isAuthenticated: true,
    isInitializing:  false
  }),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },

  // App start hone pe call karo — token check karo
  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      set({ isInitializing: false });
      return;
    }

    try {
      // Lazy import to avoid circular dependency
      const { default: api } = await import('./api');
      const res = await api.get('/auth/me');

      if (res.data.success) {
        set({
          user:            res.data.data,
          isAuthenticated: true,
          isInitializing:  false
        });
      } else {
        get().logout();
      }
    } catch (error) {
      // Token invalid ya expire — logout karo
      get().logout();
    }
  }
}));

export default useAuthStore;