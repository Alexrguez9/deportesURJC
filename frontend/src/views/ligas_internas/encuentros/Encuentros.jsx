import React, { useEffect } from "react";
import "./Encuentros.css";

const Encuentros = () => {

    useEffect(() => {
        console.log("Encuentros component mounted");
        
    }, []);

    return (
        <div id="ligas-internas-content">
        <h1>Encuentros</h1>
        <p>
            Bienvenido a la página de Encuentros de la Liga Interna de URJC Deportes.
        </p>
        <section>

        </section>
        </div>
    );
}
export default Encuentros;