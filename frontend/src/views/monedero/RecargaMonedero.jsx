import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import "./RecargaMonedero.css";
import Spinner from "../../components/spinner/Spinner";

const RecargaMonedero = () => {
    const { user, updateUser } = useAuth();
    const [importe, setImporte] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setImporte(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (importe > 0) {
            setLoading(true);

            try {
                // Actualiza el saldo del usuario
                const updatedUserData = { ...user };
                updatedUserData.saldo = user.saldo + Number(importe);
                const response = await updateUser(user._id, updatedUserData);


                setTimeout(() => {
                    setLoading(false);

                    if (response.status === 200) {
                        alert(`¡Saldo de ${importe}€ añadido!`);
                        console.log('Mi updateData', updatedUserData);
                        console.log('Mi user', user);
                    } else {
                        console.error('Error al recargar el monedero:', response.data.message);
                        alert('Error al recargar el monedero. Inténtalo de nuevo más tarde.');
                    }

                    // Envía los datos de la compra al correo del usuario
                    sendEmail(user, importe);
                    
                    // Reinicia el campo de importe
                    setImporte("");
                }, 1000); // Simulamos 1 segundo de espera

            } catch (error) {
                setLoading(false);
                console.error('Error al dar de alta:', error);
                alert('Error al dar de alta. Inténtalo de nuevo.');
            }
        } else {
            alert("Por favor, introduce un importe válido.");
        }
    };

    const sendEmail = async (user, importe) => {
        try {
            const response = await fetch("https://api.example.com/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: user.correo,
                    subject: "Recarga de monedero - URJC Deportes",
                    body: `Hola ${user.nombre},\n\nHas recargado tu monedero con un importe de €${importe}. 
                    Tu nuevo saldo es de €${user.saldo + Number(importe)}.\n\nGracias por utilizar nuestro servicio.\n\nURJC Deportes`
                })
            });

            if (response.ok) {
                alert("Datos de la compra enviados a tu correo.");
            } else {
                console.error("Error al enviar el correo");
            }
        } catch (error) {
            console.error("Error en el envío del correo:", error);
        }
    };


    return (
        <div id="recarga-monedero-content">
            <h1>Recarga de monedero</h1>
            <p>Bienvenido a la página de recarga de monedero de URJC Deportes.</p>

            {user && !loading && (
                <>
                <section>
                    <label htmlFor="importe">Introduce el importe a recargar:</label>
                    <input
                        type="number"
                        id="importe"
                        value={importe}
                        onChange={handleChange}
                        placeholder="€"
                    />
                    <button onClick={handleSubmit}>Enviar</button>
                </section>

                <section>
                    <h2>Datos de envío del justificante</h2>
                    <p><strong>Nombre:</strong> {user?.name}</p>
                    <p><strong>Correo:</strong> {user?.email}</p>
                    <p><strong>Saldo actual:</strong> {user?.saldo} €</p>
                </section>
                </>
            )}
            {!user && <p>No se ha podido cargar el usuario.</p>}
            {loading && <Spinner />}
        </div>
    );
};

export default RecargaMonedero;
