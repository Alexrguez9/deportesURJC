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
                    <Link className="navbar-link" to="/salas-preparacion">Salas y gimnasio</Link>
                    <Link className="navbar-link" to="/instalaciones">Instalaciones</Link>
                    <a className="navbar-link" href="#">Recargar monedero</a>
                </div>
                {user ?
                    <div>
                        <Link to="profile">
                        <button className="navbar-button">Mi cuenta</button>
                        </Link>
                    </div>
                : <div>
                    <Link to="profile/login">
                    <button className="navbar-button">Iniciar sesión</button>
                    </Link>
                </div>
                }
            </nav>
        </header>
    )
}

export default Header;