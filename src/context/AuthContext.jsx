import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser({ usuario: storedUser });
        }
        setLoading(false);
    }, []);

    const login = async (usuario, senha) => {
        const response = await api.post('/login', { usuario, senha });
        const { token, usuario: userResp } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', userResp);
        setUser({ usuario: userResp });
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
