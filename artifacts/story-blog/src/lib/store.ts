import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: { id: number; username: string; isAdmin: boolean } | null;
  setAuth: (token: string, user: { id: number; username: string; isAdmin: boolean }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

type LangState = {
  lang: 'ru' | 'en';
  toggleLang: () => void;
  setLang: (lang: 'ru' | 'en') => void;
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ru',
      toggleLang: () => set((state) => ({ lang: state.lang === 'ru' ? 'en' : 'ru' })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'lang-storage',
    }
  )
);
