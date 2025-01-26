import React, { useState, useEffect } from "react";
import "./AdminUsers.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../../context/AuthContext";
import AdminModalUsers from "../../../../components/adminModal/adminModalUsers/AdminModalUsers";
import BackButton from "../../../../components/backButton/BackButton";
import AccessDenied from "../../../../components/accessDenied/AccessDenied";

const AdminUsers = () => {
    const { user, isAdmin, getAllUsers, deleteUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const userList = await getAllUsers();
            setUsers(userList || []);
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
                    <p>
                        Recuerda que si creas un nuevo usuario y quieres que sea admin, debe cumplir la condición de que el email sea @admin
                    <br />
                    </p>
                    <section>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
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
                                        <td>{user?.saldo} €</td>
                                        <td>
                                            <GoPencil onClick={() => openModal(user)} className="editPencil" />
                                            <MdOutlineDelete onClick={() => handleDeleteUser(user._id)} className="deleteTrash" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </React.Fragment>
            ) : (
                <AccessDenied />
            )}
        </div>
    );
};

export default AdminUsers;
