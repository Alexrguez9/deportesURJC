import React, { useState, useEffect } from 'react';
import { useInstalacionesReservas } from '../../context/InstalacioesReservasContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import './Instalaciones.css';


const Instalaciones = () => {
    const { user } = useAuth();
    const { instalaciones, fetchInstalaciones, postReserva } = useInstalacionesReservas();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedInstalacion, setSelectedInstalacion] = useState('');
    const [precioTotal, setPrecioTotal] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    
    let handleColor = (time) => {

        return getMinDate() < time.getHours() && getMaxDate() > time.getHours() ? "text-success" : "text-error";
    };

    useEffect(() => {
        fetchInstalaciones();
    }, []);

    const getMinDate = () => {
        const instalacion = instalaciones.find(instalacion => instalacion._id === selectedInstalacion);
        if (instalacion) {
            console.log(new Date(instalacion.horario.horarioInicio).getHours());
            return new Date(instalacion.horario.horarioInicio);
        }
        return null;
    }
    
    const getMaxDate = () => {
        const instalacion = instalaciones.find(instalacion => instalacion._id === selectedInstalacion);
        if (instalacion) {
            console.log(new Date(instalacion.horario.horarioFin).getHours());
            return new Date(instalacion.horario.horarioFin);
        }
        return null;
    }

    const handleReservation = async (e) => {
        e.preventDefault();
        console.log(selectedInstalacion);
        if (!user) {
            alert("Debes iniciar sesión para reservar");
            return;
        }
        if (!selectedInstalacion) {
            alert("Debes escoger una instalación.");
            return;
        }
        if (startDate > endDate) {
            alert("La fecha de inicio debe ser anterior a la fecha de fin.");
            return;
        }
        // TODO: ver que hacer con precioTotal
        const reserva = {
            userId: user._id,
            instalacionId: selectedInstalacion,
            fechaInicio: startDate,
            fechaFin: '2024-05-05T18:00:00.000Z',
            precioTotal: 0
        };

        try {
            const response = await postReserva(reserva);
            //setPrecioTotal(response.data.precioTotal);
            //alert(`Reserva realizada con éxito. Precio total: ${response.data.precioTotal}€`);
            setSuccessMessage('Reserva realizada con éxito.');
        } catch (error) {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva. Inténtalo de nuevo.");
        }
    };

    return (
        <div>
            <h1>Instalaciones</h1>
            {user ?
                <form onSubmit={handleReservation} className='form-reservar'>
                    <div>
                        <label>Instalación:</label>
                        <select 
                            value={selectedInstalacion}
                            onChange={(e) => setSelectedInstalacion(e.target.value)}
                        >
                            {instalaciones.map(instalacion => (
                                <option key={instalacion._id} value={instalacion._id}>
                                    {instalacion.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Fecha Inicio:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            //locale="es-ES"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            timeCaption="time"
                            dateFormat="d MMMM, yyyy - h:mm aa"
                            minDate={new Date()}
                            timeClassName={handleColor}

                        />
                    </div>
                    <div>
                        <label>Fecha Fin:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            timeCaption="time"
                            dateFormat="d MMMM, yyyy - h:mm aa"
                            minDate={startDate}
                        />
                    </div>
                    <button type="submit">Reservar</button>
                </form>
                : <p>Debes iniciar sesión para reservar</p>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
        </div>
    );
};

export default Instalaciones;
