import {
    createContext,
    useState,
    useContext,
    useEffect
} from "react";
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const cookieUser = Cookies.get('user');
        if (cookieUser && !user) {
            const parsed = JSON.parse(cookieUser);
            setUser(parsed);
            setIsAuthenticated(true);
        }
    }, []);

    const getAllUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/users', {
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
                Cookies.set('user', JSON.stringify(loggedInUser), { expires: 7 }); // Set cookie with user data for 7 days
                navigate("/");
                return response;
            } else {
                console.error("Error en el fetch al back de iniciar sesión:", response.status);
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
            // Llamamos al backend para cerrar sesión
            const response = await fetch('http://localhost:4000/users/logout', {
                method: 'POST',
                credentials: 'include' // Incluir credenciales para que el servidor pueda identificar al usuario
            });
            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);
                Cookies.remove('user');
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
                    updateUserAndCookie(updatedUser);
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
    
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al actualizar el perfil");
            }
    
            updateUserAndCookie(data.user);
            return data.user;
    
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
    * IS ONLY USED IN THE APPLICATION REGISTER.
    * Initial function to assign a first admin user and thus be able to edit the roles of the other users...
    * Modify according to the needs of the application.
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
                return { ...data, role: "user" }; // If error, assign "user"
            }
    
            const { isAdmin } = await response.json();
    
            return { ...data, role: isAdmin ? "admin" : "user" };
        } catch (error) {
            console.error("Error en handleAdmin:", error);
            return { ...data, role: "user" }; // If error, assign "user"
        }
    };

    const updateUserAndCookie = (updatedUser) => {
        setUser(updatedUser);
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
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
            updateUserAndCookie
        }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
