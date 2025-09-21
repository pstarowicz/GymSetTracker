import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (response: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for saved token on mount
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            authService.setAuthToken(savedToken);
        }
    }, []);

    const login = (response: AuthResponse) => {
        const { token, userId, email } = response;
        
        // Create basic user object from auth response
        const newUser: User = {
            id: userId,
            email,
            name: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setUser(newUser);
        setToken(token);
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Set token for API calls
        authService.setAuthToken(token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.setAuthToken('');
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
