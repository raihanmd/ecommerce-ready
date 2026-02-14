import { create } from "zustand";
import { persist } from "zustand/middleware";

// Match backend response type
export interface AdminUser {
  id: string;
  username: string;
  role: {
    id: string;
    name: string; // "ADMIN" or "SUPER_ADMIN" from backend
  };
}

export interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      hasHydrated: false,

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
            },
          );

          if (!response.ok) {
            throw new Error("Invalid credentials");
          }

          const data = await response.json();
          // Backend returns { payload: { token, user } }
          const { token, user } = data.payload;

          // Save exactly as backend returns
          set({
            token,
            admin: user, // user already has correct shape: { id, username, role: { id, name } }
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true);
      },
    },
  ),
);
