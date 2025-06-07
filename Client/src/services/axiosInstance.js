import axios from 'axios';

// In development, use relative path which will be handled by Vite's proxy
// In production, use the environment variable or fallback URL
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? '' : (import.meta.env.VITE_API_URL || 'https://campus-code-wars-backend.onrender.com');
console.log('API Base URL:', baseURL);

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,  // Add /api prefix to all requests
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorDetails = {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };
    console.error('Response error:', errorDetails);

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Network errors
    if (error.message === 'Network Error') {
      console.error('Network Error: Unable to connect to the server');
      // You might want to show a user-friendly error message here
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout: The server took too long to respond');
      // You might want to show a user-friendly error message here
    }

    return Promise.reject({
      ...error,
      details: errorDetails
    });
  }
);

export default axiosInstance;
