import React, { useState, useEffect } from 'react';
import './MisReservas.css';
import moment from 'moment';
import { useAuth } from '../../../context/AuthContext';
import { useInstalacionesReservas } from '../../../context/InstalacioesReservasContext';


const MisReservas = () => {
    const { user } = useAuth();
    const { reservas, instalaciones } = useInstalacionesReservas();
    const [filteredReservas, setFilteredReservas] = useState([]);

    // metemos las filteredReservas en useEffect para esperar a que se haya cargado el user y las reservas
    useEffect(() => {
        if (user) {
            setFilteredReservas(reservas.filter(reserva => reserva.userId === user._id));
            console.log('Mis reservas:', reservas);
            console.log('UserId:', user._id);
            console.log('Mis reservas:', filteredReservas);
        }
        
    }, [reservas]);

    //TODO: mostrar nombre de instalacion, no id -> fetch instalaciones
    return (
        <div>
            <h1>Mis Reservas</h1>
            <div className='content-mis-reservas'>
                {user ?
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
                                <td>{instalaciones.find(instalacion => instalacion._id === reserva.instalacionId).nombre}</td>
                                <td>{moment(reserva.fechaInicio).format('LLLL')}</td>
                                <td>{moment(reserva.fechaFin).format('LLLL')}</td>
                                <td>{reserva.precioTotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                : <p>Inicia sesión para acceder a tus reservas</p>}
            </div>
        </div>
    );
};

export default MisReservas;