import React, { useState } from "react";
import { useAuth } from '../../../context/AuthContext';
import './Alta.css';
import BackButton from "../../../components/backButton/BackButton";

const Alta = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('');
    const { user, updateUser } = useAuth();

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handleAlta = async () => {
        console.log('Usuario alta: ', user);
        if(user) {
            if (user.alta.gimnasio.estado && user.alta.atletismo.estado) {
                alert('Ya estás dado de alta en las dos instalaciones.');
                return;
            }
        
            const updatedUserData  = { ...user };
            if (filtroDeporte === 'Gimnasio') {
                updatedUserData.alta.gimnasio = {estado: true, fechaInicio: null, fechaFin: null };
            } else if (filtroDeporte === 'Atletismo') {
                updatedUserData.alta.atletismo = {estado: true, fechaInicio: null, fechaFin: null };
            } else {
                alert('Escoge Gimnasio o Atletismo por favor.');
                return;
            }
            console.log('Mi updatedUserData al ppio', updatedUserData);
            try {
                const response = await updateUser(user._id, updatedUserData );
                
                if (response.status === 200) {
                    alert('¡Alta completada con éxito!');
                    console.log('Mi updateData', updatedUserData );
                    console.log('Mi user', user);
                } else {
                    console.error('Error al actualizar el usuario:', response.data.message);
                    alert('Error al dar de alta. Inténtalo de nuevo más tarde.');
                }
            } catch (error) {
                console.error('Error al dar de alta:', error);
                alert('Error al dar de alta2. Inténtalo de nuevo.');
            }
        }
    };
    
    // TODO: hacer simulación de pasarela de pago

    return (
        <div id="component-content">
            <div className="back-button-div">
                <BackButton />
            </div>
            <h1>Alta de sala de preparación física</h1>
            <p>Bienvenido a la página de Alta de salas de preparación física URJC Deportes.</p>
            <section>
                <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="">Escoge una opción</option>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                </select>
                <div className="button-alta">
                    {user ? <button onClick={handleAlta}>Darme de alta</button>: <p>Debes iniciar sesión para poder darte de alta</p>}
                </div>
            </section>
        </div>
    );
}
export default Alta;