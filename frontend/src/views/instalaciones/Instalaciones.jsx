import React, { useState, useEffect } from 'react';
import { useInstalacionesReservas } from '../../context/InstalacioesReservasContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import './Instalaciones.css';


const Instalaciones = () => {
    const { user } = useAuth();
    const { instalaciones, fetchInstalaciones, postReserva, getInstalacion, contarReservasPorFranjaHoraria  } = useInstalacionesReservas();

    const [startDate, setStartDate] = useState('');
    const [selectedInstalacionId, setSelectedInstalacionId] = useState('');
    const [precioTotal, setPrecioTotal] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [instalacionCompleta, setInstalacionCompleta] = useState({});

    //TODO: optimizar las llamadas a getInstalacion (3 veces: en obtenerInstalacionCompleta, getMinTime y getMaxTime)

    useEffect(() => {
        fetchInstalaciones();
    }, []);


    const obtenerInstalacionCompleta = async (id) => {
        const inst = await getInstalacion(id);
        setInstalacionCompleta(inst);
    }

    const getMinTime = () => {
        if (!selectedInstalacionId) {
            console.log('no hay instalacion seleccionada');
            return new Date();

        } else if (selectedInstalacionId) {
            const inst = getInstalacion(selectedInstalacionId);

            const startTime = new Date(inst.horario.horarioInicio);
            const hours = startTime.getHours();
            const minutes = startTime.getMinutes();

            const minTime = new Date();
            minTime.setHours(hours-2, minutes-30, 0); // ZONA HORARIA: UTC+2 (por eso restamos 2)
       
            return minTime;
        } else {
            // Handle case where selectedInstalacionId doesn't have a 'horario' property yet
            console.log('no hay horario');
            return new Date(); 
        }
    };
      
    const getMaxTime = () => {
        if (!selectedInstalacionId) {
            console.log('no hay instalacion seleccionada');
            return new Date();

        } else if (selectedInstalacionId) {
            const inst = getInstalacion(selectedInstalacionId);

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
            // Handle case where selectedInstalacionId doesn't have a 'horario' property yet
            console.log('no hay horario');
            return new Date(); 
        }
    };

    const handleReservation = async (e) => {
        e.preventDefault();
        console.log(selectedInstalacionId);
        if (!user) {
            alert("Debes iniciar sesión para reservar");
            return;
        }
        if (!selectedInstalacionId) {
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


        // TODO: ver que hacer con precioTotal
        const reserva = {
            userId: user._id,
            instalacionId: selectedInstalacionId,
            fechaInicio: startDate,
            fechaFin: endDate,
            precioTotal: instalacionCompleta.precioPorMediaHora,
        };

        const numReservas = await contarReservasPorFranjaHoraria(selectedInstalacionId, startDate);
        console.log('numReservas:', numReservas);
        if (numReservas >= instalacionCompleta.capacidad) {
            setSuccessMessage('');
            setErrorMessage('Actualmente ya hay ' + numReservas + ' reservas para esa hora. Por favor, selecciona otra hora.');
            return;
        }

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
                            value={selectedInstalacionId}
                            onChange={(e) => {
                                setSuccessMessage('');
                                setSelectedInstalacionId(e.target.value);
                                getMinTime(); // actualizamos la hora mínima y máxima cuando cambiamos de instalación
                                obtenerInstalacionCompleta(e.target.value);
                                setErrorMessage('');
                            }}
                        >
                            {instalaciones.map(instalacion => (
                                <option key={instalacion._id} value={instalacion._id}>
                                    {instalacion.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    {instalacionCompleta && <p>Capacidad por reserva para {instalacionCompleta.nombre}: {instalacionCompleta.capacidad}</p>}
                    {selectedInstalacionId ? (
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
