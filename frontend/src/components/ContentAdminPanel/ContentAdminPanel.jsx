import { useState, useEffect, Fragment } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./ContentAdminPanel.css";
import BackButton from "../../components/backButton/BackButton";
import AccessDenied from "../accessDenied/AccessDenied";


const ContentAdminPanel = () => {
    const { user, isAdmin } = useAuth();

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
                        <Link to="/admin-panel/admin-equipos" className="dropdown-link">Editar equipos</Link>
                    </div>
                </div>
            ): (
                <AccessDenied />
            )}
        </Fragment>
    );
}
export default ContentAdminPanel;