import React, { useState } from "react";
import './ConsultarPerfil.css';    
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from 'react-router-dom';


const ConsultarPerfil = () => {
    const { user, logout, deleteUser } = useAuth();
    const navigate = useNavigate();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


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
            await deleteUser(user._id);
            navigate('/'); // redirecciona a home
        } else {
            console.error('usuario no loggeado o no tiene id');
          }
    }

    return (
        <>
            <div className="profile-content">
                    <div id="profile-card">
                        <div className="profile-card-content">
                            <section>
                                <h2>Consulta de perfil</h2>
                                <div>
                                    <p>Nombre: {user.name}</p>
                                    <p>Email: {user.email}</p>
                                </div>
                                <h2>Modificación de perfil</h2>
                                <p>Próximamente...</p>
                            </section>
                            <div></div>
                            {user && (
                                <div>
                                    <p>{user.name}, ¿quieres cerrar sesión?</p>
                                    <button onClick={handleLogout}>Cerrar sesión</button>
                                    <button onClick={handleOpenDeleteConfirmation} className="delete-button">Eliminar cuenta</button>
                                    
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
        </>
    );
};

export default ConsultarPerfil;

