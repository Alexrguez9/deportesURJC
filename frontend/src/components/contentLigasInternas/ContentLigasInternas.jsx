import React from "react";
import { Link } from "react-router-dom";
import Card from "../../components/card/Card";

const MainLigasInternas = () => {
    return (
        <>
            <h1>Ligas Internas</h1>
            <p>Bienvenido a la página de Ligas Internas de URJC Deportes. Aquí podrás consultar los encuentros y clasificaciones de las Ligas Internas.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="encuentros">
                        <Card className="encuentros-card" description={"Consulta de encuentros Ligas Internas"}/>
                    </Link>
                    <Link to="clasificaciones" >
                        <Card className="clasificaciones-card"  description={"Consulta de clasificaciones Ligas Internas"} />
                    </Link>
                </div>
            </section>
        </>
    );
}

export default MainLigasInternas;
