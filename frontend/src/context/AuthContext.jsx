import {
    createContext,
    useState,
    useContext,
    useEffect
} from "react";
import API_URL from "../config/env";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`${API_URL}/users/session`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Error al verificar sesión:", error);
            }
        };
    
        fetchSession();
    }, []);

    const getAllUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Add authorization header if necessary (e.g., with token)
                },
                credentials: 'include' // Include credentials for the server to identify the user
            });
    
            if (response.ok) {
                const users = await response.json();
                return users;
            } else {
                console.error("Error al obtener la lista de usuarios:", response.status);
                return null;
            }
        } catch (error) {
            console.error("Error en el fetch para obtener usuarios:", error);
            throw error;
        }
    };
    

    const login = async (userData, navigate) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });
    
            if (response.ok) {
                // Pequeño delay para asegurar que la cookie se establece
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Check user in session
                const sessionResponse = await fetch(`${API_URL}/users/session`, {
                    credentials: 'include'
                });
    
                if (sessionResponse.ok) {
                    const sessionUser = await sessionResponse.json();
                    setUser(sessionUser);
                    setIsAuthenticated(true);
                    navigate("/");
                } else {
                    console.error("Error al obtener sesión después del login:", sessionResponse.status);
                }
            } else {
                console.error("Error al iniciar sesión:", response.status);
            }
    
            return response;
        } catch (error) {
            console.error("Error en login:", error);
            return error;
        }
    };
    

    const addUser = async (userData, navigate) => {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });
            // User already exists
            if (response.status === 409) {
                return response;
            }

            if (response.ok) {
                const registeredUser = await response.json();
                if (!user) {
                    setUser(registeredUser);
                    setIsAuthenticated(true);
                    navigate("/");
                    return response;
                } else {
                    return response;
                }
            } else {
                console.error("Error en el fetch al back de registrarse:", response.status);
                return response;
            }
        } catch (error) {
            console.error("Error2 al registrarse:", error);
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(`${API_URL}/users/logout`, {
                method: 'POST',
                credentials: 'include'
            });
    
            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);
            } else {
                console.error("Error al cerrar sesión:", response.status);
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const updateUser = async (userId, updateData) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if necessary (e.g., with token)
                },
                body: JSON.stringify(updateData),
                credentials: 'include'
            });
      
            if (response.ok) {
                const updatedUser = await response.json();
                if (user?._id === userId) {
                    setUser(updatedUser);
                }
                return response;
            } else {
                throw new Error(`Error updating user: ${response.statusText}`);
            }
            
          } catch (error) {
            console.error('Error updating user:', error);
            throw error;
          }
    };

    const updatePasswordAndName = async (userId, currentPassword, newPassword, name) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword, name }),
                credentials: 'include'
            });
    
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al actualizar el perfil");
            }
    
            setUser(data.user);
            return data.user;
    
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
          const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (response.ok) {
            if (user?._id === userId) {
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            console.error('Error deleting user:', response.statusText);
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

    const isStudent = () => {
        if (user) {
            return user.email.includes('@alumnos.urjc.es');
        } else {
            return false;
        }
    }

    /* 
    * Check if admin from the backend.
    */
    const handleAdmin = async (data) => {
        try {
            const response = await fetch(`${API_URL}/users/check-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email }),
            });
    
            if (!response.ok) {
                console.error("⚠️ Error al verificar si el usuario es admin:", response.status);
                return { ...data, role: "user" }; // If error, assign "user"
            }
    
            const { isAdmin } = await response.json();
    
            return { ...data, role: isAdmin ? "admin" : "user" };
        } catch (error) {
            console.error("Error en handleAdmin:", error);
            return { ...data, role: "user" }; // If error, assign "user"
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            getAllUsers,
            login,
            logout,
            isAuthenticated,
            addUser,
            updateUser,
            deleteUser,
            isAdmin,
            isStudent,
            handleAdmin,
            updatePasswordAndName,
        }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
