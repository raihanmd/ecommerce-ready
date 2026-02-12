import { QueryClient } from "@tanstack/react-query";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { createDebugInterceptor } from "./debug";

// Create axios instance with configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login if needed
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }

    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Please try again later.");
    }

    return Promise.reject(error);
  },
);

// Add debug interceptors in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  createDebugInterceptor(apiClient);
}

// Configure React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
