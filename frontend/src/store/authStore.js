import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      nguoiDung: null,
      token: null,
      
      setAuth: (nguoiDung, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({ nguoiDung, token });
      },
      
      logout: () => set({ nguoiDung: null, token: null }),
      
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
