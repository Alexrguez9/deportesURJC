import { IoMdArrowDropdown } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoURJCDeportes from '../../assets/logo_urjc_deportes.jpg';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        if (user) {
            logout();
            navigate('/'); // redirecciona a home
        }
    };

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
                    <Link className="navbar-link" to="/monedero">Recargar monedero</Link>
                </div>
                {user ? (
                   <div className="user-dropdown">
                        <button className="navbar-button">
                            {user.name}<IoMdArrowDropdown />
                        </button>
                        <div className="dropdown-menu">
                                <Link to="profile" className="dropdown-link">Mi cuenta</Link>
                                <Link to="profile/mis-reservas" className="dropdown-link">Mis reservas</Link>
                                <Link to="profile/mis-abonos" className="dropdown-link">Mis abonos</Link>
                                <Link to="profile/settings" className="dropdown-link">Configuración</Link>
                                {isAdmin() && <Link to="/admin-panel" className="dropdown-link">Panel Admin</Link> }
                                <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <Link to="profile/login">
                        <button className="navbar-button">Iniciar sesión</button>
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    )
}

export default Header;