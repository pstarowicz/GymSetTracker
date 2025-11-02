import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (response: AuthResponse) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved token on mount
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            authService.setAuthToken(savedToken);
        }
        setIsLoading(false);
    }, []);

    const login = (response: AuthResponse) => {
        const { token, userId, email, name } = response;
        
        // Create basic user object from auth response
        const newUser: User = {
            id: userId,
            email,
            name: name || '',
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

    const updateUser = (userData: Partial<User>) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            ...userData
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Using const instead of function declaration for better HMR compatibility
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
