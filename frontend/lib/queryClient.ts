import { QueryClient } from "@tanstack/react-query";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - attach token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      if (typeof window !== "undefined") {
        // Get auth state from localStorage
        const authStorage = localStorage.getItem("admin-auth-storage");

        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const token = parsed.state?.token;

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }
    } catch (error) {
      console.error("Failed to attach auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors WITHOUT auto-redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    try {
      // Handle 401 - DON'T auto redirect, let component handle it
      if (error.response?.status === 401) {
        console.warn("Unauthorized request:", error.config?.url);
        // Component will handle this via error state
      }

      // Handle 404 - just log it
      if (error.response?.status === 404) {
        console.warn("Resource not found:", error.config?.url);
      }

      // Handle 429 Rate Limit
      if (error.response?.status === 429) {
        console.warn("Rate limit exceeded");
      }

      // Handle 500 Server Error
      if (error.response?.status === 500) {
        console.error("Server error:", error.config?.url);
      }
    } catch (handlingError) {
      console.error("Error in error handler:", handlingError);
    }

    return Promise.reject(error);
  },
);

// Configure React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false, // Don't throw errors
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      throwOnError: false,
    },
  },
});

// Helper to get error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.statusText) {
      return error.response.statusText;
    }
    if (error.message === "Network Error") {
      return "Network error. Please check your connection.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }
    return error.message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Helper to check error type
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};
