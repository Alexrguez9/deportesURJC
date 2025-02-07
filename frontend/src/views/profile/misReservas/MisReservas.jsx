import React, { useState, useEffect } from 'react';
import './MisReservas.css';
import { useAuth } from '../../../context/AuthContext';
import { useFacilitiesAndReservations } from '../../../context/FacilitiesAndReservationsContext';


const MisReservas = () => {
    const { user } = useAuth();
    const { instalaciones, deleteReservation, getAllReservations } = useFacilitiesAndReservations();
    const [filteredReservas, setFilteredReservas] = useState([]);

    const fetchReservas = async () => {
        const reservations = await getAllReservations();
        if (user) {
            setFilteredReservas(reservations.filter(reserva => reserva.userId === user._id));
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleRemoveReserva = async (reservaId) => {
        await deleteReservation(reservaId);
        fetchReservas();
    };


    //TODO: mostrar nombre de instalacion, no id -> fetch instalaciones
    return (
        <div>
            <h1>Mis Reservas</h1>
            <div className='content-mis-reservas'>
                {user ? ( 
                    filteredReservas.length <= 0  ? ( 
                        <p>No tienes reservations</p> 
                    ) : (
                    <table className="table-mis-reservas">
                        <thead>
                            <tr>
                                <th>Instalación</th>
                                <th>Fecha inicio</th>
                                <th>Fecha fin</th>
                                <th>Precio total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.map((reserva) => (
                                <tr key={reserva._id}>
                                    <td>{instalaciones.find(instalacion => instalacion._id === reserva.instalacionId)?.nombre}</td>
                                    <td>{new Date(reserva.fechaInicio).toISOString().replace("T", " ").slice(0, 16)}</td>
                                    <td>{new Date(reserva.fechaFin).toISOString().replace("T", " ").slice(0, 16)}</td>
                                    <td>{reserva.precioTotal} €</td>
                                    <td>
                                        <button onClick={() => handleRemoveReserva(reserva._id)} className='delete-button'>
                                            Eliminar reserva
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    ))
                : <p>Inicia sesión para acceder a tus reservas</p>}
            </div>
        </div>
    );
};

export default MisReservas;