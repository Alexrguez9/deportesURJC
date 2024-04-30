import React from "react";
import "./Ligas_internas.css";

const LigasInternas = () => {
    return (
        <div id="ligas-internas-content">
        <h1>Ligas Internas</h1>
        <p>
            Bienvenido a la página de Ligas Internas de URJC Deportes. Aquí podrás
            consultar los encuentros y clasificaciones de las Ligas Internas.
        </p>
        <section>
            <h2>Consulta de encuentros</h2>
            <div className="encuentros">
            <a href="/encuentros">
                <div className="encuentros-card">
                <p>Consulta de encuentros</p>
                </div>
            </a>
            </div>
    
            <h2>Consulta de clasificaciones</h2>
            <div className="clasificaciones">
            <a href="/clasificaciones">
                <div className="clasificaciones-card">
                <p>Consulta de clasificaciones</p>
                </div>
            </a>
            </div>
        </section>
        </div>
    );
}

export default LigasInternas;