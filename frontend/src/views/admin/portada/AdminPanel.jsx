import { useState, useEffect, Fragment } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import "./AdminPanel.css";
import BackButton from "../../../components/backButton/BackButton";


const AdminPanel = () => {
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        console.log('---user---', user);
        console.log("---isAdmin", isAdmin());
    }, );
    return (
        <Fragment>
            {user && isAdmin() ? (
                <div id="component-content">
                    <div className="view-header">
                        <BackButton />
                        <h1>Panel de administrador</h1>
                        <p>
                            Bienvenido a la portada de administrador de la Liga Interna de URJC Deportes.
                        </p>
                        
                        <Link to="/ligas-internas/encuentros" className="dropdown-link">Editar partidos</Link>
                    </div>
                </div>
            ): (
                <div className="view-header">
                    <h1>Acceso denegado</h1>
                    <p>
                        No tienes permisos para acceder a esta página.
                    </p>
                </div>
            )}
        </Fragment>
    );
}
export default AdminPanel;