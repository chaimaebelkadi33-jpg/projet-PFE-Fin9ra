import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUser } from '../Services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]); // List of favorited school IDs
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await getUser();
            setUser(response.data);
            
            // If the user has favorites, store their IDs
            if (response.data.favorites) {
                setFavorites(response.data.favorites.map(f => f.id));
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await apiLogin({ email, password });
            const { user, token: newToken } = response.data;
            
            if (newToken && user) {
                localStorage.setItem('token', newToken);
                setToken(newToken);
                setUser(user);
                
                // Load favorites if available
                if (user.favorites) {
                    setFavorites(user.favorites.map(f => f.id));
                }
                
                return { success: true, user, token: newToken };
            } else {
                return { success: false, error: 'Données invalides' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Email ou mot de passe incorrect' 
            };
        }
    };

    const loginWithToken = async (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // fetchUser() is called automatically via useEffect when token changes
    };

    const register = async (name, email, password, passwordConfirmation) => {
        try {
            const response = await apiRegister({ name, email, password, password_confirmation: passwordConfirmation });
            const { user, token: newToken } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(user);
            setFavorites([]); // New user has no favorites
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                error: error.response?.data?.errors || 'Erreur lors de l\'inscription' 
            };
        }
    };

    const refreshUser = async () => {
        setLoading(true);
        await fetchUser();
    };
    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setFavorites([]);
        }
    };

    const value = {
        user,
        setUser,
        favorites,
        setFavorites,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithToken,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};