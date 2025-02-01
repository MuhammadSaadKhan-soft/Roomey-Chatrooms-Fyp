import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true,
        error: null
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = sessionStorage.getItem('jwt');
        const userData = sessionStorage.getItem('userData');

        if (token && userData) {
            setAuth({
                isAuthenticated: true,
                user: JSON.parse(userData),
                token,
                loading: false,
                error: null
            });
        } else {
            setAuth({
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: null
            });
        }

        // Handle redirection from third-party logins
        const params = new URLSearchParams(location.search);
        const githubToken = params.get('token');
        const githubUser = params.get('user');

        if (githubToken && githubUser) {
            const user = JSON.parse(decodeURIComponent(githubUser));
            login(user, githubToken);
            navigate('/create_room');
        }
    }, [location.search]);

    const login = (user, token) => {
        setAuth({
            isAuthenticated: true,
            user,
            token,
            loading: false,
            error: null
        });
        sessionStorage.setItem('jwt', token);
        sessionStorage.setItem('userData', JSON.stringify(user));

        // Redirect to the appropriate page
        navigate('/create_room');
    };

    const logout = () => {
        setAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
        });
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('userData');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};

