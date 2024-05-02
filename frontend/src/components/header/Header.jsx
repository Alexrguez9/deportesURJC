import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoURJCDeportes from '../../assets/logo_urjc_deportes.jpg';

import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user } = useAuth();

    return (
        <header>
            <nav className="navbar">
                <div className='navbar-logo'>
                    <Link to="">
                    <img src={logoURJCDeportes} alt="Logo URJC Deportes" className="navbar-logo-img"/>
                    </Link>
                </div>
                <div className="nav-links">
                    <Link className="navbar-link" to="/">Inicio</Link>
                    <Link className="navbar-link" to="/ligas-internas">Ligas Internas</Link>
                    <a className="navbar-link" href="#">Salas y gimnasio</a>
                    <a className="navbar-link" href="#">Instalaciones</a>
                    <a className="navbar-link" href="#">Recargar monedero</a>
                </div>
                <div>
                    <Link to="login">
                    {user ? <button className="navbar-button">Mi cuenta</button> : <button className="navbar-button">Iniciar sesión</button>}
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Header;