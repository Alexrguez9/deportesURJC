import React, { useState, useEffect, Fragment } from 'react';
import './MisAbonos.css';
import { useAuth } from '../../../context/AuthContext';
import { useFacilitiesAndReservations } from '../../../context/FacilitiesAndReservationsContext';


const MisAbonos = () => {
    const { user, updateUser } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState([]);

    const handleBaja = (instalacion) => async () => {
        console.log('Usuario baja: ', user);
        if(user) {
            const updatedUserData  = { ...user };
            if (instalacion === 'gimnasio') {
                updatedUserData.alta.gimnasio = { estado: false, fechaInicio: null, fechaFin: null };
            } else if (instalacion === 'atletismo') {
                updatedUserData.alta.atletismo = { estado: false, fechaInicio: null, fechaFin: null};
            }
            console.log('Mi updatedUserData al ppio', updatedUserData);
            try {
                const response = await updateUser(user._id, updatedUserData );
                if (response.status === 200) {
                    setSuccessMessage('Baja completada con éxito!');
                } else {
                    console.error('Error al actualizar el usuario:', response.data.message);
                    setErrorMessage('Error al dar de baja. Inténtalo de nuevo más tarde.');
                }
            } catch (error) {
                console.error('Error al dar de baja:', error);
                setErrorMessage('Se ha producido un error al dar de baja.');
            }
        }
    }

    useEffect(() => {
        console.log('Usuario en MisAbonos: ', user);
        console.log('user?.alta?.gimnasio?.estado:', user?.alta?.gimnasio?.estado);
        console.log('user?.alta?.atletismo?.estado:', user?.alta?.atletismo?.estado);
    }, []);

    const opcionesReservaSalas = ['gimnasio', 'atletismo'];
    const estadoAtletismo = user?.alta?.atletismo?.estado;
    const estadoGimnasio = user?.alta?.gimnasio?.estado;
    return (
        <div>
            <h1>Mis Abonos</h1>
            <div className='content-mis-reservas'>
                {user ? (
                    <Fragment>
                        <div className="card">
                            <p>Usuario: {user.name || 'Usuario'}</p>
                            <h2>GIMNASIO MENSUAL</h2>
                            {estadoGimnasio ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>Fecha inicio: { user?.alta?.gimnasio?.fechaInicio }</p>
                                    <p>Fecha caducidad: { user?.alta?.gimnasio?.fechaFin }</p>
                                    {/* <p>{ user?.alta?.gimnasio?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                    <button onClick={handleBaja('gimnasio')}>Darme de baja</button>
                                </Fragment>
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                            {user && successMessage && <p className="success-message">{successMessage}</p>}
                            {user && errorMessage && <p className="error-message">{errorMessage}</p>}
                        </div>

                        <div className="card">
                            <p>Usuario: {user.name || 'Usuario'}</p>
                            <h2>ATLETISMO MENSUAL</h2>
                            {estadoAtletismo ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>Fecha inicio: { user?.alta?.atletismo?.fechaInicio }</p>
                                    <p>Fecha caducidad: { user?.alta?.atletismo?.fechaFin }</p>
                                    {/* <p>{ user?.alta?.atletismo?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                    <button onClick={handleBaja('atletismo')}>Darme de baja</button>
                                </Fragment>
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                            {user && successMessage && <p className="success-message">{successMessage}</p>}
                            {user && errorMessage && <p className="error-message">{errorMessage}</p>}
                        </div>
                    </Fragment>
                ): <p>Debes iniciar sesión para acceder a tus abonos</p>}
            </div>
        </div>
    );
};

export default MisAbonos;