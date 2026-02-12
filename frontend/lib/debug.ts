/**
 * Debug utility for logging API calls and responses
 * Useful for debugging data fetching issues
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info';

interface DebugOptions {
  enabled: boolean;
  logLevel: LogLevel;
}

const defaultOptions: DebugOptions = {
  enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
  logLevel: 'log',
};

let debugOptions = { ...defaultOptions };

/**
 * Configure debug settings
 */
export const configureDebug = (options: Partial<DebugOptions>) => {
  debugOptions = { ...debugOptions, ...options };
};

/**
 * Log API request
 */
export const logApiRequest = (
  endpoint: string,
  method: string = 'GET',
  params?: any,
  data?: any
) => {
  if (!debugOptions.enabled) return;

  const style = 'color: #0ea5e9; font-weight: bold;';
  console.log(
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
  if (!debugOptions.enabled) return;

  const style = status >= 400
    ? 'color: #ef4444; font-weight: bold;'
    : 'color: #10b981; font-weight: bold;';

  console.log(
    `%c📥 API Response: ${status} ${endpoint}`,
    style,
    {
      status,
      endpoint,
      dataShape: typeof data,
      dataKeys: typeof data === 'object' ? Object.keys(data || {}) : null,
      duration: duration ? `${duration}ms` : 'unknown',
      timestamp: new Date().toISOString(),
      data,
    }
  );
};

/**
 * Log API error
 */
export const logApiError = (
  endpoint: string,
  error: any,
  params?: any
) => {
  if (!debugOptions.enabled) return;

  const style = 'color: #ef4444; font-weight: bold;';
  console.error(
    `%c❌ API Error: ${endpoint}`,
    style,
    {
      endpoint,
      error: error.message || error,
      status: error.response?.status,
      statusText: error.response?.statusText,
      params,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    }
  );
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
  if (!debugOptions.enabled) return;

  const style = 'color: #8b5cf6; font-weight: bold;';
  console.log(
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
};

/**
 * Log component state
 */
export const logComponentState = (
  componentName: string,
  state: Record<string, any>
) => {
  if (!debugOptions.enabled) return;

  const style = 'color: #f59e0b; font-weight: bold;';
  console.log(
    `%c🎨 Component: ${componentName}`,
    style,
    {
      componentName,
      ...state,
      timestamp: new Date().toISOString(),
    }
  );
};

/**
 * Log data structure
 */
export const logDataStructure = (label: string, data: any) => {
  if (!debugOptions.enabled) return;

  const style = 'color: #06b6d4; font-weight: bold;';
  const structure = typeof data === 'object'
    ? {
        type: Array.isArray(data) ? 'Array' : 'Object',
        length: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
        keys: Array.isArray(data) ? null : Object.keys(data || {}),
        sample: Array.isArray(data) ? data[0] : data,
      }
    : typeof data;

  console.log(
    `%c📋 Data: ${label}`,
    style,
    {
      label,
      structure,
      full: data,
      timestamp: new Date().toISOString(),
    }
  );
};

/**
 * Log timing information
 */
export const logTiming = (label: string, callback: () => any) => {
  if (!debugOptions.enabled) {
    return callback();
  }

  const start = performance.now();
  const result = callback();
  const duration = performance.now() - start;

  const style = 'color: #14b8a6; font-weight: bold;';
  console.log(
    `%c⏱️  Timing: ${label}`,
    style,
    {
      label,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    }
  );

  return result;
};

/**
 * Create a debug-enabled axios interceptor
 */
export const createDebugInterceptor = (apiClient: any) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config: any) => {
      logApiRequest(config.url, config.method, config.params, config.data);
      return config;
    },
    (error: any) => {
      logApiError(error.config?.url, error, error.config?.params);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: any) => {
      const duration = response.config.metadata?.startTime
        ? performance.now() - response.config.metadata.startTime
        : undefined;
      logApiResponse(response.config.url, response.status, response.data, duration);
      return response;
    },
    (error: any) => {
      logApiError(
        error.config?.url,
        error,
        error.config?.params
      );
      return Promise.reject(error);
    }
  );

  // Add metadata for timing
  apiClient.interceptors.request.use((config: any) => {
    config.metadata = { startTime: performance.now() };
    return config;
  });
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
