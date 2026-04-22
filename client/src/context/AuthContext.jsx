import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('gethired_token'));
    const [loading, setLoading] = useState(true);

    // Set axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Load user on mount
    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    async function fetchUser() {
        try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const res = await axios.post('/api/auth/login', { email, password });
        const { user: userData, token: newToken } = res.data.data;
        localStorage.setItem('gethired_token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return userData;
    }

    async function register(name, email, password, skills) {
        const res = await axios.post('/api/auth/register', { name, email, password, skills });
        const { user: userData, token: newToken } = res.data.data;
        localStorage.setItem('gethired_token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return userData;
    }

    function logout() {
        localStorage.removeItem('gethired_token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    }

    async function updateProfile(data) {
        const res = await axios.put('/api/auth/profile', data);
        setUser(res.data.data);
        return res.data.data;
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            token,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            updateProfile,
            fetchUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
