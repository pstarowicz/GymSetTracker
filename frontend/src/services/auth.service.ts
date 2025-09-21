import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

const API_URL = '/api/auth';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/login`, data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/register`, data);
        return response.data;
    },

    setAuthToken(token: string) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }
};
