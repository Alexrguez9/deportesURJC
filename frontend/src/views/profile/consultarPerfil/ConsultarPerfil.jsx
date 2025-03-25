import { Fragment, useState } from "react";
import { toast } from "sonner";
import './ConsultarPerfil.css';    
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const ConsultarPerfil = () => {
    const { user, setUser, isAdmin, logout, deleteUser, updatePasswordAndName } = useAuth();
    const { reservas, deleteReservation } = useFacilitiesAndReservations();
    const navigate = useNavigate();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [updatedName, setUpdatedName] = useState(user?.name || '');
    const [updatedPassword, setUpdatedPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');

    const handleOpenDeleteConfirmation = () => {
        setShowDeleteConfirmation(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
    };

    const handleLogout = () => {
        if (user) {
            logout();
            navigate('/'); // redirecciona a home
        }
    };

    const handleDeleteAccount = async () => {
        if (user && user._id) {
            const userReservas = reservas.filter(reserva => reserva.userId === user._id);
            for (const reservation of userReservas) {
                await deleteReservation(reservation._id);
            }
            const res = await deleteUser(user._id);
            if (res.status === 200) {
                toast.success('Cuenta eliminada con éxito.');
            } else {
                toast.error('Ha ocurrido un error al eliminar tu cuenta. Inténtalo de nuevo.');
            }
            navigate('/'); // Redirecciona a home
        } else {
            console.error('Usuario no loggeado o no tiene ID');
            toast.error('Ha ocurrido un error al eliminar tu cuenta. Inténtalo de nuevo.');
        }
    };

    const handleEditProfile = async () => {
        if (!updatedName.trim() || !updatedPassword.trim()) {
            toast.error("El nombre y la contraseña no pueden estar vacíos.");
            return;
        }

        try {
            const updatedUserRes = await updatePasswordAndName(user?._id, currentPassword, updatedPassword, updatedName);
            console.log('---updatedUserRes---', updatedUserRes);
            /* istanbul ignore if */
            if (!updatedUserRes) {
                toast.error("Error al actualizar el perfil. Inténtalo de nuevo.");
                return;
            }
            toast.success("Perfil actualizado con éxito.");

            const { user: updatedUser } = updatedUserRes;
            await setUser(updatedUser);
            setEditMode(false);
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast.error("Hubo un error al actualizar tu perfil. Inténtalo de nuevo.");
        }
    };

    console.log('---user---', user);

    return (
        <Fragment>
            <div className="profile-content">
                <div id="profile-card">
                    <div className="card-no-hover">
                        <section>
                            <h2>Mi cuenta</h2>
                            <div className="centered-div profile-info">
                                <p>Nombre: {user?.name}</p>
                                <p>Email: {user?.email}</p>
                                <p>Saldo: {user?.balance} €</p>
                                {isAdmin() && <p>Role: {user?.role}</p>}
                            {editMode ? (
                                <div className="centered-div">
                                    <label>
                                        Nuevo nombre:
                                        <input
                                            type="text"
                                            value={updatedName}
                                            onChange={(e) => setUpdatedName(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Contraseña actual:
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Nueva contraseña:
                                        <input
                                            type="password"
                                            value={updatedPassword}
                                            onChange={(e) => setUpdatedPassword(e.target.value)}
                                        />
                                    </label>
                                    <button onClick={handleEditProfile}>Guardar cambios</button>
                                    <button onClick={() => { setEditMode(false)} }>Cancelar</button>
                                </div>
                            ) : (
                                user && <button onClick={() => { setEditMode(true)} }>Editar perfil</button>
                            )}
                            </div>
                        </section>
                        {user && (
                            <div className="profile-div-buttons">
                                <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                                <button onClick={handleOpenDeleteConfirmation} className="delete-profile-button">Eliminar cuenta</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showDeleteConfirmation && (
                <div className="delete-confirmation-popup">
                    <div className="delete-confirmation-content">
                        <h2>Confirmar eliminación de cuenta</h2>
                        <p>¿Estás seguro de que quieres eliminar tu cuenta de forma permanente?</p>
                        <div className="confirmation-buttons">
                            <button onClick={handleDeleteAccount} className="delete-button">Eliminar definitivamente</button>
                            <button onClick={handleCloseDeleteConfirmation}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            
        </Fragment>
    );
};

export default ConsultarPerfil;