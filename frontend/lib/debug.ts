/**
 * Debug utility for logging API calls and responses
 * Enhanced with error handling to prevent crashes
 */

type LogLevel = "log" | "warn" | "error" | "info";

interface DebugOptions {
  enabled: boolean;
  logLevel: LogLevel;
}

const defaultOptions: DebugOptions = {
  enabled:
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development",
  logLevel: "log",
};

let debugOptions = { ...defaultOptions };

/**
 * Configure debug settings
 */
export const configureDebug = (options: Partial<DebugOptions>) => {
  try {
    debugOptions = { ...debugOptions, ...options };
  } catch (error) {
    console.error("Failed to configure debug:", error);
  }
};

/**
 * Safe console log wrapper
 */
const safeLog = (
  method: "log" | "warn" | "error" | "info",
  ...args: any[]
) => {
  try {
    if (!debugOptions.enabled) return;
    console[method](...args);
  } catch (error) {
    // Fail silently - logging errors shouldn't crash the app
  }
};

/**
 * Log API request
 */
export const logApiRequest = (
  endpoint: string,
  method: string = "GET",
  params?: any,
  data?: any
) => {
  try {
    if (!debugOptions.enabled) return;

    const style = "color: #0ea5e9; font-weight: bold;";
    safeLog(
      "log",
      `%c📤 API Request: ${method} ${endpoint}`,
      style,
      {
        method,
        endpoint,
        params,
        data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    // Fail silently
  }
};

/**
 * Log API response
 */
export const logApiResponse = (
  endpoint: string,
  status: number,
  data: any,
  duration?: number
) => {
  try {
    if (!debugOptions.enabled) return;

    const style =
      status >= 400
        ? "color: #ef4444; font-weight: bold;"
        : "color: #10b981; font-weight: bold;";

    safeLog(
      "log",
      `%c📥 API Response: ${status} ${endpoint}`,
      style,
      {
        status,
        endpoint,
        dataShape: typeof data,
        dataKeys: typeof data === "object" ? Object.keys(data || {}) : null,
        duration: duration ? `${duration}ms` : "unknown",
        timestamp: new Date().toISOString(),
        data,
      }
    );
  } catch (error) {
    // Fail silently
  }
};

/**
 * Log API error
 */
export const logApiError = (endpoint: string, error: any, params?: any) => {
  try {
    if (!debugOptions.enabled) return;

    const style = "color: #ef4444; font-weight: bold;";
    safeLog(
      "error",
      `%c❌ API Error: ${endpoint}`,
      style,
      {
        endpoint,
        error: error?.message || error,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        params,
        data: error?.response?.data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    // Fail silently
  }
};

/**
 * Log query hook data
 */
export const logQueryData = (
  hookName: string,
  state: {
    data?: any;
    isLoading?: boolean;
    error?: any;
    status?: string;
  }
) => {
  try {
    if (!debugOptions.enabled) return;

    const style = "color: #8b5cf6; font-weight: bold;";
    safeLog(
      "log",
      `%c🔍 Query: ${hookName}`,
      style,
      {
        hookName,
        status: state.status,
        isLoading: state.isLoading,
        hasData: !!state.data,
        hasError: !!state.error,
        error: state.error?.message,
        timestamp: new Date().toISOString(),
        data: state.data,
      }
    );
  } catch (error) {
    // Fail silently
  }
};

/**
 * Log component state
 */
export const logComponentState = (
  componentName: string,
  state: Record<string, any>
) => {
  try {
    if (!debugOptions.enabled) return;

    const style = "color: #f59e0b; font-weight: bold;";
    safeLog(
      "log",
      `%c🎨 Component: ${componentName}`,
      style,
      {
        componentName,
        ...state,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    // Fail silently
  }
};

/**
 * Log data structure
 */
export const logDataStructure = (label: string, data: any) => {
  try {
    if (!debugOptions.enabled) return;

    const style = "color: #06b6d4; font-weight: bold;";
    const structure =
      typeof data === "object"
        ? {
            type: Array.isArray(data) ? "Array" : "Object",
            length: Array.isArray(data)
              ? data.length
              : Object.keys(data || {}).length,
            keys: Array.isArray(data) ? null : Object.keys(data || {}),
            sample: Array.isArray(data) ? data[0] : data,
          }
        : typeof data;

    safeLog(
      "log",
      `%c📋 Data: ${label}`,
      style,
      {
        label,
        structure,
        full: data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    // Fail silently
  }
};

/**
 * Log timing information
 */
export const logTiming = (label: string, callback: () => any) => {
  if (!debugOptions.enabled) {
    return callback();
  }

  try {
    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;

    const style = "color: #14b8a6; font-weight: bold;";
    safeLog(
      "log",
      `%c⏱️  Timing: ${label}`,
      style,
      {
        label,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      }
    );

    return result;
  } catch (error) {
    console.error("Error in timing callback:", error);
    return callback();
  }
};

/**
 * Create a debug-enabled axios interceptor with error handling
 */
export const createDebugInterceptor = (apiClient: any) => {
  try {
    // Request interceptor
    apiClient.interceptors.request.use(
      (config: any) => {
        try {
          logApiRequest(config.url, config.method, config.params, config.data);
        } catch (error) {
          // Don't let logging errors break the request
        }
        return config;
      },
      (error: any) => {
        try {
          logApiError(error.config?.url, error, error.config?.params);
        } catch (err) {
          // Don't let logging errors break the error handling
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    apiClient.interceptors.response.use(
      (response: any) => {
        try {
          const duration = response.config.metadata?.startTime
            ? performance.now() - response.config.metadata.startTime
            : undefined;
          logApiResponse(
            response.config.url,
            response.status,
            response.data,
            duration
          );
        } catch (error) {
          // Don't let logging errors break the response
        }
        return response;
      },
      (error: any) => {
        try {
          logApiError(error.config?.url, error, error.config?.params);
        } catch (err) {
          // Don't let logging errors break the error handling
        }
        return Promise.reject(error);
      }
    );

    // Add metadata for timing
    apiClient.interceptors.request.use((config: any) => {
      try {
        config.metadata = { startTime: performance.now() };
      } catch (error) {
        // Fail silently
      }
      return config;
    });
  } catch (error) {
    console.error("Failed to create debug interceptor:", error);
  }
};

export default {
  configureDebug,
  logApiRequest,
  logApiResponse,
  logApiError,
  logQueryData,
  logComponentState,
  logDataStructure,
  logTiming,
  createDebugInterceptor,
};