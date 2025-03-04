import { useUserStore } from '@/stores/useUserStore';
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://demo-heavenly-try.vercel.app/api",
  withCredentials: true,
});


// Simple flag to prevent multiple refresh attempts
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    
    // Skip refresh for auth endpoints
    if (
      !originalRequest || 
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    console.log('Response error:', {
      status: error.response?.status,
      message: error.response?.data,
      url: originalRequest.url,
      isRefreshing
    });

    // Only attempt refresh on 401 and if not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      console.log('Attempting token refresh');
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/auth/refresh-token');
        console.log('Token refresh successful:', response.data);
        
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.log('Token refresh failed:', refreshError.response?.data);
        isRefreshing = false;
        
        // Clear user state and redirect to login
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance