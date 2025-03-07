import React, { useState, useEffect } from "react";
import "./AdminUsers.css";
import { Outlet } from "react-router-dom";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import AdminModalUsers from "../../../../components/adminModal/adminModalUsers/AdminModalUsers";
import BackButton from "../../../../components/backButton/BackButton";
import AccessDenied from "../../../../components/accessDenied/AccessDenied";
import Spinner from "../../../../components/spinner/Spinner";

const AdminUsers = () => {
    const { user, isAdmin, getAllUsers, deleteUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const[isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const userList = await getAllUsers();
            setUsers(userList || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Error al obtener la lista de usuarios:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openModal = (user) => {
        if (!user) {
            setPopupData({ email: "", name: "", role: "", saldo: 0 });
            const newUser = true; // Variable temporal
            setIsNewUser(newUser);
            setIsModalOpen(true);
            return;
        }
        const newPopupData = { ...user };
        setPopupData(newPopupData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsNewUser(false);
        fetchUsers();
        setPopupData(null); // TODO: hacer falta? 
    };

    const handleDeleteUser = async (userId) => {
        if (!isAdmin()) {
            setErrorMessage("No tienes permisos para eliminar usuarios");
            return;
        }
        try {
            await deleteUser(userId);
            setSuccessMessage("Usuario eliminado correctamente");
            await fetchUsers();
        } catch (error) {
            setErrorMessage("Error al eliminar usuario");
            console.error("Error al eliminar usuario:", error);
        }
    }

    return (
        <div id="component-content">
            { isLoading && <Spinner />}
            {isAdmin() ? (
                <React.Fragment>
                     {isModalOpen &&(
                        <AdminModalUsers closeModal={closeModal} isOpen={isModalOpen} popupData={popupData} isNewUser={isNewUser}  />
                    )}
                    <div className="top-buttons-content">
                        <BackButton />
                        {user && isAdmin() && (
                            <GoPlus onClick={() => openModal()} className="iconPlus" size="1.5em" />
                        )}
                    </div>
                    <h1>Usuarios</h1>
                    <p>
                        Aquí puedes administrar los usuarios registrados en la web.
                    </p>
                    <section>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Alta GYM</th>
                                    <th>Alta Atletismo</th>
                                    <th>Saldo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user?._id}>
                                        <td>{user?.name}</td>
                                        <td>{user?.email}</td>
                                        <td>{user?.role}</td>
                                        <td>{user?.alta?.gimnasio?.estado ? "Sí" : "No"}</td>
                                        <td>{user?.alta?.atletismo?.estado ? "Sí" : "No"}</td>
                                        <td>{user?.saldo} €</td>
                                        <td>
                                            <GoPencil onClick={() => openModal(user)} className="editPencil" />
                                            <MdOutlineDelete onClick={() => handleDeleteUser(user._id)} className="deleteTrash" />
                                            <IoEyeOutline
                                                onClick={() => navigate(`/admin-panel/admin-usuarios/${user._id}`)} // Navega a la vista de detalle
                                                className="infoButton"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                </React.Fragment>
            ) : (
                <AccessDenied />
            )}
            
        </div>
    );
};

export default AdminUsers;
