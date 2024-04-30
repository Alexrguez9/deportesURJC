import React from "react";
import "./Profile.css";

const Profile = () => {
    return (
        <div id="profile-content">
            <h1>Perfil</h1>
            <p>
                Bienvenido a la página de perfil de URJC Deportes. Aquí podrás
                consultar y modificar tu perfil.
            </p>
            <section>
                <h2>Consulta de perfil</h2>
                <div className="perfil">
                    <a href="/perfil">
                        <div className="perfil-card">
                            <p>Consulta de perfil</p>
                        </div>
                    </a>
                </div>

                <h2>Modificación de perfil</h2>
                <div className="modificar">
                    <a href="/modificar">
                        <div className="modificar-card">
                            <p>Modificación de perfil</p>
                        </div>
                    </a>
                </div>
            </section>
        </div>
    );
}
export default Profile;