import React from 'react';
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
                        <div className="admin-buttons-div">
                            <Link to="/ligas-internas/encuentros" className="button-light">Editar resultados</Link>
                            <Link to="/admin-panel/admin-equipos" className="button-light">Editar equipos</Link>
                            <Link to="/admin-panel/admin-usuarios" className="button-light">Editar usuarios</Link>
                            <Link to="/admin-panel/admin-reservas" className="button-light">Editar reservas</Link>
                            <Link to="/admin-panel/admin-instalaciones" className="button-light">Editar instalaciones</Link>
                        </div>
                        
                    </div>
                </div>
            ): (
                <AccessDenied />
            )}
        </Fragment>
    );
}
export default ContentAdminPanel;