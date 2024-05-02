import React, { createContext, useState, useContext } from "react";

// Creamos contexto
const AuthContext = createContext();

// Creamos provider
export const AuthProvider = ({ children }) => {
    //1. Traemos los datos del usuario del localStorage
    const storedUserData = JSON.parse(localStorage.getItem('userData')) || null;
    
    const [user, setUser] = useState(storedUserData);
    const [isAuthenticated, setIsAuthenticated] = useState(storedUserData !== null);

    const login = (userData) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);