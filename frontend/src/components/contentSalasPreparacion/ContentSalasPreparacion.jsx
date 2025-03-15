import { Link } from "react-router-dom";
import Card from "../../components/card/Card";

const ContentSalasPreparacion = () => {
    return (
        <>
            <h1>Salas y Gimnasio</h1>
            <p>Bienvenido a la página de Salas y Gimnasio de URJC Deportes.<br></br>
                Aquí podrás darte de alta en las salas de preparacion y hacer reservas en estas salas. 
                Además, podrás recargar tu mensualidad.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="alta">
                        <Card className="encuentros-card" description={"Alta de usuarios - Salas de preparación física"}/>
                    </Link>
                    <Link to="pago-abono">
                        <Card className="home-card" description={"Pago mensual Abono"} />
                    </Link>
                    <Link to="reservas-preparacion" >
                        <Card className="clasificaciones-card" description={"Reserva de espacio - Salas de preparación física"} />
                    </Link>
                </div>
            </section>
        </>
    );
}

export default ContentSalasPreparacion;
