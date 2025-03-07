import { Fragment, useState } from "react";
import './ConsultarPerfil.css';    
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const ConsultarPerfil = () => {
    const { user, logout, deleteUser, updateUser } = useAuth();
    const { reservas, deleteReservation } = useFacilitiesAndReservations();
    const navigate = useNavigate();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [updatedName, setUpdatedName] = useState(user?.name || '');
    const [updatedPassword, setUpdatedPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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

            await deleteUser(user._id);
            navigate('/'); // Redirecciona a home
        } else {
            console.error('Usuario no loggeado o no tiene ID');
        }
    };

    const handleEditProfile = async () => {
        if (!updatedName.trim() || !updatedPassword.trim()) {
            setErrorMessage("El nombre y la contraseña no pueden estar vacíos.");
            return;
        }

        try {
            await updateUser(user._id, {
                name: updatedName,
                password: updatedPassword,
            });

            setSuccessMessage("Perfil actualizado con éxito.");
            setEditMode(false);
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            setErrorMessage("Hubo un error al actualizar tu perfil. Inténtalo de nuevo.");
        }
    };

    return (
        <Fragment>
            <div className="profile-content">
                <div id="profile-card">
                    <div className="profile-card-content">
                        <section>
                            <h2>Mi cuenta</h2>
                            <div className="centered-div profile-info">
                                <p>Nombre: {user?.name}</p>
                                <p>Email: {user?.email}</p>
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
                                        Nueva contraseña:
                                        <input
                                            type="password"
                                            value={updatedPassword}
                                            onChange={(e) => setUpdatedPassword(e.target.value)}
                                        />
                                    </label>
                                    <button onClick={handleEditProfile}>Guardar cambios</button>
                                    <button onClick={() => { setEditMode(false); setErrorMessage('');} }>Cancelar</button>
                                </div>
                            ) : (
                                user && <button onClick={() => {setEditMode(true); setSuccessMessage('');}}>Editar perfil</button>
                            )}
                            {user && successMessage && <p className="success-message">{successMessage}</p>}
                            {user && errorMessage && <p className="error-message">{errorMessage}</p>}
                            </div>
                        </section>
                        <div></div>
                        {user && (
                            <div>
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