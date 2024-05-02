import React from 'react';
import './Home.css';
import Card from '../../components/card/Card';

const Home = () => {
    return (
        <div id="home-content">
            <h1>Inicio</h1>
            <p>Bienvenido a la página de inicio de URJC Deportes</p>
            <section>
                <h2>Ligas Internas</h2>
                <div className='ligas-internas'>
                    <Card className="home-card"  description={"Consulta de encuentros Ligas Internas"}/>
                    <Card className="home-card"   description={"Consulta de clasificaciones Ligas Internas"} />
                </div>

                <h2>Salas de preparación y gimnasio</h2>
                <div className='salas-gimnasio'>
                    <Card className="home-card" description={"Alta de usuarios - Salas de preparación física"} />
                    <Card className="home-card" description={"Pago mensual Abono Gimnasio"} />
                    <Card className="home-card" description={"Reserva de espacio - Salas de preparación física"} />
                </div>
                
                <h2>Instalaciones deportivas</h2>
                <div className='instalaciones'>
                        <Card className="home-card" description={"Reservas instalaciones deportivas URJC"} />
                </div>
            </section>
        </div>
    )
}
export default Home;
