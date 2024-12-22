import React, { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import './Alta.css';
import BackButton from "../../../components/backButton/BackButton";

const Alta = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('Gimnasio');
    const { user, updateUser } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setErrorMessage('');
        setSuccessMessage('');
    }, [filtroDeporte]);

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    
    const calculateNewDate = () => {
        if (user) {
            const fechaInicio = new Date();
            const fechaFin = new Date().getDate() + 30;

            // <p>{user?.alta?.di.toLocaleString('es-ES', { month: 'long', year: 'numeric' })} / {fechaFin.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
            //     <p>{fechaInicio.toLocaleDateString('es-ES')} - {fechaFin.toLocaleDateString('es-ES')}</p>
            //     <p><em>{fechaInicio.toLocaleDateString('es-ES', { weekday: 'long' })}</em></p>

            return [fechaInicio, fechaFin];
        }
        return [null, null];
    };
    

    const handleAlta = async () => {
        console.log('Usuario alta: ', user);
        if(user) {
            if (user.alta.gimnasio.estado && user.alta.atletismo.estado) {
                setErrorMessage('Ya estás dado de alta en las dos instalaciones.');
                return;
            }
            const [fechaInicio, fechaFin] = calculateNewDate();
            const updatedUserData  = { ...user };
            if (filtroDeporte === 'Gimnasio') {
                updatedUserData.alta.gimnasio = { estado: true, fechaInicio: fechaInicio, fechaFin: fechaFin };
            } else if (filtroDeporte === 'Atletismo') {
                updatedUserData.alta.atletismo = { estado: true, fechaInicio: fechaInicio, fechaFin: fechaFin};
            } else {
                setErrorMessage('Escoge una opción válida por favor.');
                return;
            }
            console.log('Mi updatedUserData al ppio', updatedUserData);
            try {
                const response = await updateUser(user._id, updatedUserData );
                
                if (response.status === 200) {
                    setSuccessMessage('Alta completada con éxito!');
                } else {
                    console.error('Error al actualizar el usuario:', response.data.message);
                    setErrorMessage('Error al dar de alta. No se ha podido actulizar tu usuario');
                }
            } catch (error) {
                console.error('Error al dar de alta:', error);
                setErrorMessage('Error al dar de alta2. Inténtalo de nuevo más tarde.');
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
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                </select>
                <div className="button-alta">
                    {user ? <button onClick={handleAlta}>Darme de alta</button>: <p>Debes iniciar sesión para poder darte de alta</p>}
                </div>
                {user && successMessage && <p className="success-message">{successMessage}</p>}
                {user && errorMessage && <p className="error-message">{errorMessage}</p>}
            </section>
        </div>
    );
}
export default Alta;