import React from "react";
import { Link } from "react-router-dom";
import Card from "../../components/card/Card";
import './ContentProfile.css';

const ContentProfile = () => {
    return (
        <>
            <h1>Profile</h1>
            <p>Bienvenido a la página de Profile de URJC Deportes.<br></br>
                Aquí podrás ver y gestionar tus reservas, así como tus datos.</p>
            <section>
                <div className='ligas-internas'>
                    <Link to="consultar-perfil" >
                        <Card className="clasificaciones-card"  description={"Consultar perfil"} />
                    </Link>
                    <Link to="mis-reservas">
                        <Card className="encuentros-card" description={"Mis reservas"}/>
                    </Link>
                    
                </div>
            </section>
        </>
    );
}

export default ContentProfile;
