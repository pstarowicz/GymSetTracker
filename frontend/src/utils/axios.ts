import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Request Headers:', config.headers);
    console.log('Interceptor token:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Verify the token is properly set
      console.log('Authorization Header:', config.headers.Authorization);
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Only logout on 401 unauthorized, not on 403 forbidden
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
