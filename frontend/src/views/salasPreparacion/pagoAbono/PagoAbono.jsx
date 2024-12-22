import React, { useEffect, useState } from "react";
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PagoAbono.css';
import BackButton from '../../../components/backButton/BackButton';
import Spinner from '../../../components/spinner/Spinner';

const PagoAbono = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('');
    const { user, updateUser } = useAuth();
    const navigate = useNavigate()
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

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
    

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handlePago = async () => {
        // TODO: hacer simulación de pasarela de pago
        setLoading(true);
        if(user) {
            if (!user?.alta?.gimnasio?.estado && !user?.alta?.atletismo?.estado) {
                alert('No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).');
                return;
            }
            
            const [fechaInicio, fechaFin] = calculateNewDate();
            if (!fechaInicio || !fechaFin) {
                alert('No se pudo calcular la fecha de renovación. Por favor verifica los datos.');
                return;
            }

            const updateData = {...user};
            if (filtroDeporte === 'Gimnasio') {
                updateData.alta.gimnasio = { estado: true, fechaInicio: fechaInicio, fechaFin: fechaFin };
            } else if (filtroDeporte === 'Atletismo') {
                updateData.alta.atletismo = { estado: true, fechaInicio: fechaInicio, fechaFin: fechaFin };
            } else {
                alert('Escoge Gimnasio o Atletismo por favor.');
                return;
            }
        
            try {
                const response = await updateUser(user._id, updateData);
                setTimeout(() => {
                    setLoading(false);
                    if (response.status === 200) {
                        setSuccessMessage('Pago completado con éxito!');
                        // TODO: hacer simulación de pago
                    } else {
                        console.error('Error al actualizar el usuario:', response.data.message);
                        alert('Error al dar de alta. Inténtalo de nuevo más tarde.');
                    }
                });
            } catch (error) {
                console.error('Error al dar de alta:', error);
                alert('Error al dar de alta2. Inténtalo de nuevo.');
            }
        }
    };

    const handleAlta = () => {
        navigate('/salas-preparacion/alta'); 
    };

    return (
        <div id="component-content">
                <div className="back-button-div">
                    <BackButton />
                </div>
            <h1>Pago Abono</h1>
            <p>Bienvenido a la página de pago del abono de atletismo o gimnasio de la URJC.
                <br />Aquí podrás abonar por 30 días más tu abono de atletismo o gimnasio.
            </p>
            {user ? (
                (user?.alta?.gimnasio?.estado || user?.alta?.atletismo?.estado) ? (
                <section>
                    <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="">Escoge una opción</option>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                    </select>
                    
                    <div className="centered-div button-alta">
                    {user?.alta?.[filtroDeporte.toLowerCase()]?.estado ? (
                        <button onClick={handlePago}>Renovar</button>
                        ) : (
                            <button onClick={handlePago}>Pagar</button>
                        )
                    }
                    </div>
                    {loading && <Spinner />}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </section>
                ) : (
                <div>
                    <p className="text-error">
                    No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).
                    </p>
                    <button onClick={handleAlta}>Alta de usuarios</button>
                </div>
                )
            ) : (
                <p>Debes iniciar sesión para poder darte de alta</p>
            )
            }
        </div>
    );
}
export default PagoAbono;