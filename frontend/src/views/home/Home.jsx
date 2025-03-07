import './Home.css';
import Card from '../../components/card/Card';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div id="home-content">
            <h1>Inicio</h1>
            <p>Bienvenido a la página de inicio de URJC Deportes</p>
            <section>
                <h2>Ligas Internas</h2>
                <div className='ligas-internas'>
                    <Link to="/ligas-internas/encuentros">
                        <Card className="home-card"  description={"Consulta de encuentros Ligas Internas"}/>
                    </Link>
                    <Link to="/ligas-internas/clasificaciones">
                        <Card className="home-card"   description={"Consulta de clasificaciones Ligas Internas"} />
                    </Link>
                </div>

                <h2>Salas de preparación y gimnasio</h2>
                <div className='salas-gimnasio'>
                    <Link to="/salas-preparacion/alta">
                        <Card className="home-card" description={"Alta de usuarios - Salas de preparación física"} />
                    </Link>
                    <Link to="/salas-preparacion/pago-abono">
                        <Card className="home-card" description={"Pago mensual Abono Gimnasio"} />
                    </Link>
                    <Link to="/salas-preparacion/reservas-preparacion">
                        <Card className="home-card" description={"Reserva de espacio - Salas de preparación física"} />
                    </Link>
                </div>
                
                <h2>Instalaciones deportivas</h2>
                <div className='instalaciones'>
                    <Link to="/instalaciones">
                        <Card className="home-card" description={"Reservas instalaciones deportivas URJC"} />
                    </Link>
                    
                </div>
            </section>
        </div>
    )
}
export default Home;
