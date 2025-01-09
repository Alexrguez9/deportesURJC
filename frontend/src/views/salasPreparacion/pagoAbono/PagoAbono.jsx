import React, { useEffect, useState } from "react";
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentForm from "../../../components/paymentSimulation/PaymentSimulation";
import { sendEmail } from '../../../utils/mails';
import './PagoAbono.css';
import { studentsPricesMessage, externalPrice } from './CONSTANTS';
import BackButton from '../../../components/backButton/BackButton';
import Spinner from '../../../components/spinner/Spinner';

const PagoAbono = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('Gimnasio');
    const { user, updateUser, isStudent } = useAuth();
    const navigate = useNavigate()
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState([]);
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
    
    useEffect(() => {
        setErrorMessage('');
        setSuccessMessage('');
    }, [filtroDeporte]);

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handlePago = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);
        if(user) {
            if (!user?.alta?.gimnasio?.estado && !user?.alta?.atletismo?.estado) {
                errorMessage('No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).');
                return;
            }
            
            const [fechaInicio, fechaFin] = calculateNewDate();
            if (!fechaInicio || !fechaFin) {
                errorMessage('No se pudo calcular la fecha de renovación. Por favor verifica los datos.');
                return;
            }

            const updateData = {...user};
            if (filtroDeporte === 'Gimnasio') {
                if (!user?.alta?.gimnasio?.estado) {
                    setErrorMessage(['No estás dado de alta en el gimnasio.']);
                    setLoading(false);
                    return;
                }
                updateData.alta.gimnasio = { estado: true, fechaInicio: fechaInicio, fechaFin: fechaFin };
            } else if (filtroDeporte === 'Atletismo') {
                if (!user?.alta?.atletismo?.estado) {
                    setErrorMessage(['No estás dado de alta en el atletismo.']);
                    setLoading(false);
                    return;
                }
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
                        sendEmail(
                            user.email,
                            'DeportesURJC - Confirmación de Pago de abono',
                            `Hola ${user.name},\n\n` +
                            `Tu pago del Abono de ${filtroDeporte} ha sido completado con éxito.\n¡Nos vemos pronto!\n\n` +
                            `Gracias por utilizar nuestro servicio.\nDeportes URJC`
                        );
                    } else {
                        console.error('Error al actualizar el usuario:', response.data.message);
                        alert('Error al dar de alta. Inténtalo de nuevo más tarde.');
                    }
                });
            } catch (error) {
                console.error('Error al dar de alta:', error);
                alert('Se ha producido un error al dar de alta. Inténtalo de nuevo.');
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
                <br />Aquí podrás abonar <b>por 30 días</b> tu abono de atletismo o gimnasio.
                <br />Coste del abono: <b> {isStudent() ? studentsPricesMessage : externalPrice + '€'} </b>
            </p>
            {user ? (
                (user?.alta?.gimnasio?.estado || user?.alta?.atletismo?.estado) ? (
                <section>
                    <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                    </select>
                    
                    <div className="centered-div button-alta">
                    {!isStudent() && <PaymentForm externalPrice={externalPrice} onPayment={handlePago} />}
                    {isStudent() && (
                        user?.alta?.[filtroDeporte.toLowerCase()]?.estado ? (
                            <button onClick={handlePago}>Renovar</button>
                            ) : (
                                <button onClick={handlePago}>Pagar</button>
                            )
                    
                    )}
                    </div>
                    {loading && <Spinner />}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
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