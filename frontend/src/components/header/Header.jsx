import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoURJCDeportes from '../../assets/logo_urjc_deportes.jpg';

const Header = () => {
    return (
        <header>
            <nav className="navbar">
                <div className='navbar-logo'>
                    <img src={logoURJCDeportes} alt="Logo URJC Deportes" className="navbar-logo-img"/>
                </div>
                <div className="nav-links">
                    <Link className="navbar-link" to="/">Inicio</Link>
                    <Link className="navbar-link" to="/ligas-internas">Ligas Internas</Link>
                    <a className="navbar-link" href="#">Salas y gimnasio</a>
                    <a className="navbar-link" href="#">Instalaciones</a>
                    <a className="navbar-link" href="#">Recargar monedero</a>
                </div>
                <div>
                    <button className="navbar-button">Mi cuenta/Iniciar Sesión</button>
                </div>
            </nav>
        </header>
    )
}

export default Header;