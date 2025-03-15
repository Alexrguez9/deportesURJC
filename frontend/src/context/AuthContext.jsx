import {
    createContext,
    useState,
    useContext
} from "react";

// Creamos contexto
const AuthContext = createContext();

// Creamos provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const getAllUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Añade headers de autorización si son necesarios
                },
                credentials: 'include' // Incluir credenciales para autenticación del usuario
            });
    
            if (response.ok) {
                const users = await response.json();
                return users;
            } else {
                console.error("Error al obtener la lista de usuarios:", response.status);
                return null; // Manejar el error según sea necesario
            }
        } catch (error) {
            console.error("Error en el fetch para obtener usuarios:", error);
            throw error;
        }
    };
    

    const login = async (userData, navigate) => {
        try {
            // Llamamos al backend para iniciar sesión
            const response = await fetch('http://localhost:4000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            if (response.ok) {
                const loggedInUser = await response.json();
                setUser(loggedInUser);
                setIsAuthenticated(true);
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

    const addUser = async (userData, navigate) => {
        try {
            const response = await fetch('http://localhost:4000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include' // Incluir credenciales para que el servidor pueda identificar al usuario
            });
            if (response.status === 409) {
                // Caso de usuario duplicado
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
                // mostrar un mensaje de error al usuario
                return response;
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
                console.error("Error al cerrar sesión:", response.status);
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
            const response = await fetch(`http://localhost:4000/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword, name }),
                credentials: 'include'
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo actualizar el perfil`);
            }
    
            const updatedUser = await response.json();
            return updatedUser;
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
          const response = await fetch(`http://localhost:4000/users/${userId}`, {
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
    * SOLAMENTE SE HACE USO EN EL REGISTER DE LA APLICACIÓN
    * Función inicial para asignarpoer tener un primer usuario admin y así, poder ir editando los roles de los demás usuarios...
    * Modificar según las necesidades de la aplicación. 
    */
    const handleAdmin = async (data) => {
        try {
            const response = await fetch("http://localhost:4000/users/check-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email }),
            });
    
            if (!response.ok) {
                console.error("⚠️ Error al verificar si el usuario es admin:", response.status);
                return { ...data, role: "user" }; // Si hay error, asignamos "user" por defecto
            }
    
            const { isAdmin } = await response.json();
    
            return { ...data, role: isAdmin ? "admin" : "user" };
        } catch (error) {
            console.error("Error en handleAdmin:", error);
            return { ...data, role: "user" }; // Si hay error de red, asignamos "user"
        }
    };
    
    

    return (
        <AuthContext.Provider value={{ user, setUser, getAllUsers, login, logout, isAuthenticated, addUser, updateUser, deleteUser, isAdmin, isStudent, handleAdmin, updatePasswordAndName }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
