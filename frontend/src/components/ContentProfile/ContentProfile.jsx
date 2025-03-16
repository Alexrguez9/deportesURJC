import { Link } from "react-router-dom";
import './ContentProfile.css';
import { PiCalendarCheck } from "react-icons/pi";
import { FiUser } from "react-icons/fi";

const ContentProfile = () => {
    return (
        <>
            <h1>Profile</h1>
            <p>Bienvenido a la página de Profile de URJC Deportes.<br></br>
                Aquí podrás ver y gestionar tus reservas, así como tus datos.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="consultar-perfil" >
                        <div className='horizontal-card'>
                            <FiUser style={{ padding: '1rem' }}/>
                            <p>Consultar perfil</p>
                        </div>
                    </Link>
                    <Link to="mis-reservas">
                        <div className='horizontal-card'>
                            <PiCalendarCheck style={{ padding: '1rem' }}/>
                            <p>Mis reservas</p>
                        </div>
                    </Link>
                    
                </div>
            </section>
        </>
    );
}

export default ContentProfile;
