import React from "react";
import './ConsultarPerfil.css';    
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from 'react-router-dom';


const ConsultarPerfil = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate()

    const handleLogout = () => {
        if (user) {
            logout();
            navigate('/'); // redirecciona a home
        }
    };

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
                            <div><button onClick={handleLogout}>Cerrar sesión</button></div>
                            {user && (
                                <div>
                                    <p>¿Quieres cerrar sesión {user.name}?</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </>
    );
};

export default ConsultarPerfil;

