import React, { useState, useEffect } from 'react';
import { useInstalacionesReservas } from '../../context/InstalacioesReservasContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import './Instalaciones.css';


const Instalaciones = () => {
    const { user } = useAuth();
    const { instalaciones, fetchInstalaciones, postReserva, getInstalacion  } = useInstalacionesReservas();

    const [startDate, setStartDate] = useState('');
    const [selectedInstalacion, setSelectedInstalacion] = useState('');
    const [precioTotal, setPrecioTotal] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    //TODO: optimizar las llamadas a getInstalacion (3 veces)

    useEffect(() => {
        fetchInstalaciones();
      }, []);

      const getMinTime = () => {
        if (!selectedInstalacion) {
            console.log('no hay instalacion seleccionada');
            return new Date();

        } else if (selectedInstalacion) {
            const inst = getInstalacion(selectedInstalacion);

            const startTime = new Date(inst.horario.horarioInicio);
            const hours = startTime.getHours();
            const minutes = startTime.getMinutes();

            const minTime = new Date();
            minTime.setHours(hours-2, minutes-30, 0); // ZONA HORARIA: UTC+2 (por eso restamos 2)
       
            return minTime;
        } else {
            // Handle case where selectedInstalacion doesn't have a 'horario' property yet
            console.log('no hay horario');
            return new Date(); 
        }
      };
      
    const getMaxTime = () => {
    if (!selectedInstalacion) {
        console.log('no hay instalacion seleccionada');
        return new Date();

    } else if (selectedInstalacion) {
        const inst = getInstalacion(selectedInstalacion);

        const startTime = new Date(inst.horario.horarioFin);
        let hours = startTime.getHours();
        let minutes = startTime.getMinutes();

        // Si acaba a y 30, la hora máxima para reservar es media hora antes
        if ( minutes == 30 ){
            minutes = 0;
        } else if (minutes == 0){
            minutes = 30;
            hours = hours - 1;
        }

        const maxTime = new Date();
        maxTime.setHours(hours-2, minutes, 0); // ZONA HORARIA: UTC+2 (por eso restamos 2)
    
        return maxTime;
    } else {
        // Handle case where selectedInstalacion doesn't have a 'horario' property yet
        console.log('no hay horario');
        return new Date(); 
    }
      };
      

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
        let endDate = new Date(startDate);
        if (endDate.getMinutes() == 30) {
            endDate.setHours(endDate.getHours() + 1);
            endDate.setMinutes(0);
        } else if(endDate.getMinutes() == 0) {
            endDate.setMinutes(30);
        }

        const inst = getInstalacion(selectedInstalacion);
        console.log('inst precio:', inst.precioPorMediaHora);

        // TODO: ver que hacer con precioTotal
        const reserva = {
            userId: user._id,
            instalacionId: selectedInstalacion,
            fechaInicio: startDate,
            fechaFin: endDate,
            precioTotal: inst.precioPorMediaHora,
        };

        try {
            const response = await postReserva(reserva);
            console.log(response);
            //setPrecioTotal(response.data.precioTotal);
            //alert(`Reserva realizada con éxito. Precio total: ${response.data.precioTotal}€`);
            if (response.ok) {
                setSuccessMessage('Reserva realizada con éxito.');
            } else {
                setErrorMessage('Hubo un problema al realizar la reserva. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva. Inténtalo de nuevo.");
        }
    };

    return (
        <div>
            <h1>Instalaciones</h1>
            <p>Selecciona una instalación y una fecha para reservar.</p>
            {user ?
                <form onSubmit={handleReservation} className='form-reservar'>
                    <div>
                        <label>Instalación:</label>
                        <select 
                            value={selectedInstalacion}
                            onChange={(e) => {
                                setSuccessMessage('');
                                setSelectedInstalacion(e.target.value)
                                getMinTime(); // actualizamos la hora mínima y máxima cuando cambiamos de instalación
                                console.log('actualizamos hora minima y maxima');
                                console.log(selectedInstalacion);
                            }}
                        >
                            {instalaciones.map(instalacion => (
                                <option key={instalacion._id} value={instalacion._id}>
                                    {instalacion.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedInstalacion ? (
                        <>
                            <div>
                                <label>Fecha Inicio:</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => {
                                        setSuccessMessage('');
                                        setStartDate(date)
                                        }
                                    }
                                    //locale="es-ES"
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={30}
                                    timeCaption="time"
                                    dateFormat="d MMMM, yyyy - h:mm aa"
                                    minTime={ getMinTime() }
                                    maxTime={ getMaxTime() }
                                    minDate={new Date()}
                                />
                            </div>
                            <button type="submit">Reservar</button>
                        </>
                        ) : (<p></p>)
                    }
                       
                </form>
                : <p>Debes iniciar sesión para reservar</p>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default Instalaciones;
