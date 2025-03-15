import { useState, useEffect, Fragment } from "react";
import { toast } from "sonner";
import "./AdminUsers.css";
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
            setPopupData({ email: "", name: "", role: "", balance: 0 });
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
        /* istanbul ignore if*/
        if (!isAdmin()) {
            toast.error("No tienes permisos para eliminar usuarios");
            return;
        }
        try {
            await deleteUser(userId);
            toast.success("Usuario eliminado correctamente");
            await fetchUsers();
        } catch (error) {
            toast.error("Error al eliminar usuario");
            console.error("Error al eliminar usuario:", error);
        }
    }

    return (
        <div id="component-content">
            { isLoading && <Spinner />}
            {isAdmin() ? (
                <Fragment>
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
                                {users.map((userInList) => (
                                    <tr key={userInList?._id} className={userInList?._id === user?._id ? 'active-user' : ''}>
                                        <td>{userInList?.name}</td>
                                        <td>{userInList?.email}</td>
                                        <td>{userInList?.role}</td>
                                        <td>{userInList?.alta?.gimnasio?.estado ? "Sí" : "No"}</td>
                                        <td>{userInList?.alta?.atletismo?.estado ? "Sí" : "No"}</td>
                                        <td>{userInList?.balance} €</td>
                                        <td className="actions">
                                            <GoPencil onClick={() => openModal(userInList)} className="editPencil" />
                                            <MdOutlineDelete onClick={() => handleDeleteUser(userInList._id)} className="deleteTrash" />
                                            <IoEyeOutline
                                                onClick={() => navigate(`/admin-panel/admin-usuarios/${userInList._id}`)}
                                                className="infoButton"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </Fragment>
            ) : (
                <AccessDenied />
            )}
            
        </div>
    );
};

export default AdminUsers;
