export interface User {
    id: number;
    email: string;
    name: string;
    weight?: number;
    height?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends LoginRequest {
    name: string;
    weight?: number;
    height?: number;
}
