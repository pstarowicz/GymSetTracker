import { axiosInstance } from '@/utils/axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

const API_URL = '/api/auth';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post(`${API_URL}/login`, data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post(`${API_URL}/register`, data);
        return response.data;
    },

    setAuthToken(token: string) {
        // Token is automatically handled by axios interceptor
        return;
    }
};
