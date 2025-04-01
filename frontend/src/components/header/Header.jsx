import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';
import logoURJCDeportes from '../../assets/logo_urjc_deportes.jpg';
import { FiUser } from "react-icons/fi";
import { PiCalendarCheck, PiWallet } from "react-icons/pi";
import { MdAdminPanelSettings } from "react-icons/md";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    
    const handleLogout = () => {
        logout();
        navigate('/');
        handleClick();
    };

    // Only for mobile
    const handleClick = () => {
        if (window.innerWidth <= 768) {
          toggleMenu();
        }
      };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [menuOpen]);

    return (
        <header>
            <nav className="navbar">
                <div className='navbar-logo'>
                    <Link to="">
                        <img src={logoURJCDeportes} alt="Logo URJC Deportes" className="navbar-logo-img"/>
                    </Link>
                </div>

                <div className="hamburger-menu-icon" onClick={toggleMenu}>
                    <RxHamburgerMenu size={30} style={{color: 'white'}} />
                </div>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <div className="close-icon" onClick={toggleMenu}>
                        <IoMdClose size={30} style={{color: 'white'}} />
                    </div>
                    <Link className="navbar-link" to="/" onClick={handleClick}>Inicio</Link>
                    <Link className="navbar-link" to="/ligas-internas" onClick={handleClick}>Ligas Internas</Link>
                    <Link className="navbar-link" to="/salas-preparacion" onClick={handleClick}>Salas y gimnasio</Link>
                    <Link className="navbar-link" to="/instalaciones" onClick={handleClick}>Instalaciones</Link>
                    <Link className="navbar-link" to="/monedero" onClick={handleClick}>Recargar monedero</Link>

                    {user ? (
                        <>
                            {menuOpen ? (
                                // Show links in dropdown in mobile mode
                                <>
                                    <Link className="navbar-link" to="profile" onClick={toggleMenu}>
                                        <FiUser style={{ padding: '1rem' }} />
                                        Mi cuenta
                                    </Link>
                                    <Link className="navbar-link" to="profile/mis-reservas" onClick={toggleMenu}>
                                        <PiCalendarCheck style={{ padding: '1rem' }} />
                                        Mis reservas
                                    </Link>
                                    <Link className="navbar-link" to="profile/mis-abonos" onClick={toggleMenu}>
                                        <PiWallet style={{ padding: '1rem' }} />
                                        Mis abonos
                                    </Link>
                                    {isAdmin() && 
                                        <Link className="navbar-link" to="/admin-panel" onClick={toggleMenu}>
                                            <MdAdminPanelSettings style={{ padding: '1rem' }} />
                                            Panel Admin
                                        </Link>
                                    }
                                    <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                                </>
                            ) : (
                                <>
                                    {/* Show user dropdown in desktop mode */}
                                    <div className="user-dropdown">
                                        <button className="navbar-button">
                                            {user.name}<IoMdArrowDropdown />
                                        </button> 
                                        <div className="dropdown-menu">
                                            <Link to="profile" className="dropdown-link">
                                                <FiUser style={{ padding: '1rem' }} />
                                                Mi cuenta
                                            </Link>
                                            <Link to="profile/mis-reservas" className="dropdown-link">
                                                <PiCalendarCheck style={{ padding: '1rem' }} />
                                                Mis reservas
                                            </Link>
                                            <Link to="profile/mis-abonos" className="dropdown-link">
                                                <PiWallet style={{ padding: '1rem' }} />
                                                Mis abonos
                                            </Link>
                                            {isAdmin() && 
                                                <Link to="/admin-panel" className="dropdown-link">
                                                    <MdAdminPanelSettings style={{ padding: '1rem' }} />
                                                    Panel Admin
                                                </Link>
                                            }
                                            <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div>
                            <Link to="profile/login">
                                <button className="navbar-button" onClick={handleClick}>Iniciar sesión</button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
