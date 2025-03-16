import { Link } from "react-router-dom";
import { CgGym } from "react-icons/cg";
import { PiWallet } from "react-icons/pi";

const ContentSalasPreparacion = () => {
    return (
        <>
            <h1>Salas de preparación</h1>
            <p>Bienvenido a la página de Salas de preparación de URJC Deportes.
            <br />Aquí podrás darte de alta en las salas de preparación (atletismo y gimnasio) y recargar tu mensualidad.
            <br />Además, podrás reservar espacio.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="/salas-preparacion/alta">
                        <div className='horizontal-card'>
                            <CgGym style={{ padding: '1rem' }}/>
                            <p>Altas en salas de preparación</p>
                        </div>
                    </Link>
                    <Link to="/salas-preparacion/pago-abono">
                        <div className='horizontal-card'>
                            <PiWallet style={{ padding: '1rem' }}/>
                            <p>Pago mensual abonos</p>
                        </div>
                    </Link>
                    <Link to="/salas-preparacion/reservas-preparacion">
                        <div className='horizontal-card'>
                            <p>Reserva de espacio</p>
                        </div>
                    </Link>
                </div>
            </section>
        </>
    );
}

export default ContentSalasPreparacion;
