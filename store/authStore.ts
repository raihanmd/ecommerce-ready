import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Super Admin";
}

export interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, admin: AdminUser) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Call your backend login endpoint
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
          const { token, user } = data.data;

          set({
            token,
            admin: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role.name,
            },
            isAuthenticated: true,
            isLoading: false,
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

      setToken: (token: string, admin: AdminUser) => {
        set({
          token,
          admin,
          isAuthenticated: true,
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
    },
  ),
);
