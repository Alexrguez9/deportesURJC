import './Home.css';
import { Link } from 'react-router-dom';
import { PiRankingLight, PiWallet, PiCalendarCheck } from "react-icons/pi";
import { CgGym } from "react-icons/cg";
import { MdEmojiEvents } from "react-icons/md";

const Home = () => {
    return (
        <div id="home-content">
            <h1>Inicio</h1>
            <p>Bienvenido a la página de inicio de URJC Deportes</p>
            <section>
                <h2>Ligas Internas</h2>
                <div className='ligas-internas'>
                    <Link to="/ligas-internas/encuentros">
                        <div className='horizontal-card'>
                            <MdEmojiEvents style={{ padding: '1rem', height: '2rem', width: '2rem' }}/>
                            <p>Encuentros</p>
                        </div>
                    </Link>
                    <Link to="/ligas-internas/clasificaciones">
                        <div className='horizontal-card'>
                            <PiRankingLight style={{ padding: '1rem', height: '2rem', width: '2rem' }}/>
                            <p>Clasificaciones</p>
                        </div>
                    </Link>
                </div>

                <h2>Salas de preparación</h2>
                <div className='salas-gimnasio'>
                    <Link to="/salas-preparacion/alta">
                        <div className='horizontal-card'>
                            <CgGym style={{ padding: '1rem', height: '2rem', width: '2rem' }}/>
                            <p>Altas</p>
                        </div>
                    </Link>
                    <Link to="/salas-preparacion/pago-abono">
                        <div className='horizontal-card'>
                            <PiWallet style={{ padding: '1rem', height: '2rem', width: '2rem' }}/>
                            <p>Pago mensual abonos</p>
                        </div>
                    </Link>
                </div>
                
                <h2>Instalaciones deportivas</h2>
                <div className='instalaciones'>
                    <Link to="/instalaciones">
                        <div className='horizontal-card'>
                            <PiCalendarCheck style={{ padding: '1rem', height: '2rem', width: '2rem' }}/>
                            <p>Reservas</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}
export default Home;
