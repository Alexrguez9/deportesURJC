import React, { createContext, useState, useContext } from "react";

// Creamos contexto
const AuthContext = createContext();

// Creamos provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    const login = async (userData) => {
        try {
            // Llamamos al backend para iniciar sesión
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include' // Incluir credenciales para que el servidor pueda identificar al usuario
            });

            if (response.ok) {
                const loggedInUser = await response.json();
                setUser(loggedInUser);
                setIsAuthenticated(true);
            } else {
                console.error("Error en el fetch al back de iniciar sesión:", response.status);
                // mostrar un mensaje de error al usuario
            }
        } catch (error) {
            console.error("Error2 al iniciar sesión:", error);
        }
    };

    const register = async (userData) => {
        try {
            // Llamamos al backend para iniciar sesión
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include' // Incluir credenciales para que el servidor pueda identificar al usuario
            });

            if (response.ok) {
                const registeredUser = await response.json();
                setUser(registeredUser);
                setIsAuthenticated(true);
            } else {
                console.error("Error en el fetch al back de registrarse:", response.status);
                // mostrar un mensaje de error al usuario
            }
        } catch (error) {
            console.error("Error2 al registrarse:", error);
        }
    };

    const logout = async () => {
        try {
            // Llamamos al backend para cerrar sesión
            const response = await fetch('http://localhost:3000/users/logout', {
                method: 'POST',
                credentials: 'include' // Incluir credenciales para que el servidor pueda identificar al usuario
            });

            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);
            } else {
                // Manejar errores de cierre de sesión según sea necesario
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Manejar errores según sea necesario
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, register }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);