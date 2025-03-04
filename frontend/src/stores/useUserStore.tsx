import { create } from 'zustand';
import axiosInstance from '../lib/axios';  
import { toast } from 'react-hot-toast';
import type { User, UserStore, SignupData, LoginData, resetPasswordData } from '../types/user';
import { UpdateProfileFormData } from '@/_auth/schema/formSchema';


export type VerificationResponse = {
  success: boolean;
  message?: string; // Optional message property
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null, 
  loading: false,
  checkingAuth: true,
  success: false,
  attempts: 0,
  error: null,

  signup: async ({ username, email, password, confirmPassword, gender }: SignupData) => {
    set({ loading: true });
  
    // Check for password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      set({ loading: false });
      return;
    }
  
    try {
      // Signup API call
      const response = await axiosInstance.post<{ message: string }>('/auth/signup', {
        username,
        email,
        password,
        gender,
      });
  
      set({ loading: false });
  
      // Notify user to check email for verification
      toast.success(response.data.message || 'Signup successful! Please verify your email.');
    } catch (error: any) {
      set({ loading: false });
  
      // Handle common error scenarios
      if (error?.response?.status === 400) {
        toast.error(error.response.data.message || 'Email already exists');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }
  },
  
  login: async ({ email, password }: LoginData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post<{ user: User, message: string }>('/auth/login', { email, password });
      toast.success(response.data.message);

      set({
        user: response.data.user,
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  },

  // Improved logout handler
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ user: null });
      toast.success('Successfully logged out');
    } catch (error: any) {
      set({ user: null });
      // toast.error(error?.response?.data?.message || 'An error occurred during logout');
    }
  },


  verifyEmail: async (token: string): Promise<VerificationResponse> => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get<VerificationResponse>(
        `/auth/verify-email/${token}`
      );
      set({ loading: false, success: true });
      return {
        success: true,
        message: response.data.message || "Email verified successfully!",
      };
    } catch (error: any) {
      set({ loading: false, success: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email verification failed";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
  
  checkAuth: async () => {
    set({ checkingAuth: true }); // Start loading
    try {
      const response = await axiosInstance.get<{ profile: User | null }>('/auth/profile');
      set({
        user: response.data.profile, // Update user state
        checkingAuth: false,        // Stop loading
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('User is not authenticated'); // Handle expected 401 error
      } else {
        console.error('Error checking authentication:', error); // Log unexpected errors
      }
      set({ user: null, checkingAuth: false }); // Clear user state and stop loading
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true }); // Start loading
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
  
      // Store the number of attempts from the response
      set({ attempts: response.data.attempts || 1 });
  
      toast.success('Password reset email sent successfully, check your inbox.');
    } catch (error: any) {
      // Check for different error scenarios
      let errorMessage = '';
  
      if (error.response?.data?.errors?.[0]?.msg) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Failed to send password reset email';
      }
  
      toast.error(errorMessage); // Display the error message
    } finally {
      setTimeout(() => {
        set({ loading: false });
      }, 1000); // 1000 ms (1 second)
    }
  },
  
  resetPassword: async ({ token, newPassword, confirmPassword }: resetPasswordData) => {
    set({ loading: true });
    try {
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        set({ loading: false });
        return;
      }
  
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
      toast.success(response.data.message || 'Password reset successful! Redirecting to login page...');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;
    set({ checkingAuth: true });

    try {
      console.log('Store: Attempting to refresh token');
      const response = await axiosInstance.post('/auth/refresh-token');
      console.log('Store: Token refresh response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Store: Token refresh error:', error.response?.data);
      set({ user: null });
      throw error;
    } finally {
      set({ checkingAuth: false });
    }
  },

  updateProfile: async (data: UpdateProfileFormData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch('/auth/profile', data);
      set({ user: response.data.user, loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message)
      set({
        error: error.response?.data?.message || error.message || 'Update failed',
        loading: false
      });
      throw error;
    }
  },
  
}));
