import React, { createContext, useState, useContext } from "react";

// Creamos contexto
const AuthContext = createContext();

// Creamos provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (userData, navigate) => {
        try {
            // Llamamos al backend para iniciar sesión
            const response = await fetch('http://localhost:4000/users/login', {
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
                console.log("Usuario logueado:", loggedInUser);
                navigate("/");
                return response;
            } else {
                console.error("Error en el fetch al back de iniciar sesión:", response.status);
                // mostrar un mensaje de error al usuario
                return response;
            }
        } catch (error) {
            console.error("Error2 al iniciar sesión:", error);
            return error;
        }
    };

    const register = async (userData, navigate) => {
        try {
            //TODO: ver si hay que revisar si existe previamente el usuario
            // Llamamos al backend para iniciar sesión
            const response = await fetch('http://localhost:4000/users/register', {
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
                navigate("/");
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
            const response = await fetch('http://localhost:4000/users/logout', {
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

    const updateUser = async (userId, updateData) => {
        try {
            const response = await fetch(`http://localhost:4000/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                // Add authorization header if necessary (e.g., with token)
              },
              body: JSON.stringify(updateData),
            });
      
            if (response.ok) {
                const updatedUser = await response.json();
                console.log("updatedUser AuthContext", updatedUser);
                setUser(updatedUser); // Update user state in context
                return response;
            } else {
                throw new Error(`Error updating user: ${response.statusText}`);
            }
            
          } catch (error) {
            console.error('Error updating user:', error);
            throw error;
          }
    }

    const deleteUser = async (userId) => {
        try {
          const response = await fetch(`http://localhost:4000/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include' // Include credentials for authorization
          });
          console.log('DeleteUser auth', user);
          if (response.ok) {
            setUser(null); // Set user state to null in context
            setIsAuthenticated(false); // Set authentication state to false
          } else {
            console.error('Error deleting user:', response.statusText);
            // Handle deletion errors as needed (e.g., display error message)
          }
          return response;
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      };

    const isAdmin = () => {
        if (user) {
            return user.role === 'admin';
        } else {
            return false;
        }
    };
      

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated, register, updateUser, deleteUser, isAdmin }}>
        {children}
        </AuthContext.Provider>
    );
};



export const useAuth = () => useContext(AuthContext);