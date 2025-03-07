import React, { useState, useEffect } from 'react';
import { useFacilitiesAndReservations } from '../../context/FacilitiesAndReservationsContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import './Instalaciones.css';
import { sendEmail } from '../../utils/mails';
import { useForm } from "react-hook-form";

const Instalaciones = () => {
    const { user } = useAuth();
    const { getAllFacilities, addReservation, getInstalacion, contarReservasPorFranjaHoraria  } = useFacilitiesAndReservations();
    const [facilities, setFacilities] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [selectedInstalacionId, setSelectedInstalacionId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [instalacionCompleta, setInstalacionCompleta] = useState({});
    const [minTime, setMinTime] = useState(new Date());
    const [maxTime, setMaxTime] = useState(new Date());

    const {
            register,
            handleSubmit,
            formState: { errors: errorFacilities },
        } = useForm({
            userId: user?._id || '',
            instalacionId: selectedInstalacionId || '',
            fechaInicio: '',
            fechaFin: '',
            precioTotal: instalacionCompleta?.precioPorMediaHora || 0,
        });

    //TODO: optimizar las llamadas a getInstalacion (3 veces: en obtenerInstalacionCompleta, getMinTime y getMaxTime)

   const fetchFacilities = async () => {
        try {
            const facilityList = await getAllFacilities();
            setFacilities(facilityList || []);
        } catch (error) {
            /* istanbul ignore next */
            console.error("Error al obtener las instalaciones:", error);
        }
   };
 
   useEffect(() => {
       fetchFacilities();
       const fetchTimes = async () => {
        if (selectedInstalacionId) {
            const min = await getMinTime();
            const max = await getMaxTime();
            setMinTime(min);
            setMaxTime(max);
        }
    };
    fetchTimes();
   }, [selectedInstalacionId]);


    const obtenerInstalacionCompleta = async (id) => {
        const inst = await getInstalacion(id);
        await setInstalacionCompleta(inst);
    }

    const getMinTime = async () => {
        if (!selectedInstalacionId) return new Date();
    
        const inst = await getInstalacion(selectedInstalacionId);
        /* istanbul ignore next */
        if (!inst || !inst.horario || !inst.horario.horarioInicio) {
            console.error("Error: Instalación sin horario válido", inst);
            return new Date();
        }
    
        const startTime = new Date(inst.horario.horarioInicio);
         /* istanbul ignore if */
        if (isNaN(startTime.getTime())) {
            console.error("Error: La fecha no es válida", startTime);
            return new Date();
        }
    
        startTime.setHours(startTime.getHours() - 2); // Ajuste UTC+2
        return startTime;
    };
    
      
    const getMaxTime = async () => {
        if (!selectedInstalacionId) {
            /* istanbul ignore next */ 
            return new Date();
        } else if (selectedInstalacionId) {
            const inst = await getInstalacion(selectedInstalacionId);

            const startTime = new Date(inst?.horario?.horarioFin);
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
            /* istanbul ignore next */ 
            return new Date(); 
        }
    };

    const onSubmit =  (data) => {
        handleReservation(data);
    };

    const handleReservation = async (data) => {
        // e.preventDefault();
        await obtenerInstalacionCompleta(data.facilityId);

        /* istanbul ignore next */
        let endDate = new Date(startDate);
        /* istanbul ignore if */
        if (endDate.getMinutes() == 30) {
            endDate.setHours(endDate.getHours() + 1);
            endDate.setMinutes(0);
        } else if(endDate.getMinutes() == 0) {
            endDate.setMinutes(30);
        }

        // TODO: ver que hacer con precioTotal
        const reserva = {
            userId: user?._id,
            instalacionId: selectedInstalacionId,
            fechaInicio: startDate,
            fechaFin: endDate,
            precioTotal: instalacionCompleta?.precioPorMediaHora,
        };

        const numReservas = await contarReservasPorFranjaHoraria(selectedInstalacionId, startDate);
        if (numReservas >= instalacionCompleta.capacidad) {
            setSuccessMessage('');
            setErrorMessage('Actualmente ya hay ' + numReservas + ' reservas para esa hora. Por favor, selecciona otra hora.');
            return;
        }

        try {
            const response = await addReservation(reserva);
            //setPrecioTotal(response.data.precioTotal);
            //alert(`Reserva realizada con éxito. Precio total: ${response.data.precioTotal}€`);
            if (response.ok) {
                sendEmail(
                    user.email,
                    'DeportesURJC - Confirmación de reserva',
                    `Hola ${user.name},\n\n` +
                    `Tu reserva de la instalación ${instalacionCompleta.nombre} ha sido realizada con éxito.\nFecha: ${startDate}.\nPrecio total: ${instalacionCompleta.precioPorMediaHora}€.\n¡Nos vemos pronto!\n\n` +
                    `Gracias por utilizar nuestro servicio.\nDeportes URJC`
                );
                setSuccessMessage('Reserva realizada con éxito.');
            } else {
                setErrorMessage('Hubo un problema al realizar la reserva. Inténtalo de nuevo.');
            }
        } catch (error) {
            /* istanbul ignore next */
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva. Inténtalo de nuevo.");
        }
    };

    return (
        <div>
            <h1>Instalaciones</h1>
            <p>Selecciona una instalación y una fecha para reservar.
                <br />Recuerde que el pago de las instalaciones se debe efectuar en efectivo al llegar.
                <br />Las reservas son de media hora en media hora.
            </p>
                {selectedInstalacionId && (<p>Precio por media hora: {instalacionCompleta?.precioPorMediaHora}€.</p>)}

            {user ?
                <form onSubmit={handleSubmit(onSubmit)} className="form-reservar" data-testid="reservation-form">
                    <div>
                        <label>Instalación:
                            <select
                                {...register("facilityId", { required: "Por favor, selecciona un deporte" })}
                                    value={selectedInstalacionId}
                                    onChange={(e) => {
                                        setSuccessMessage('');
                                        setSelectedInstalacionId(e.target.value);
                                        getMinTime(); // actualizamos la hora mínima y máxima cuando cambiamos de instalación
                                        obtenerInstalacionCompleta(e.target.value);
                                        setErrorMessage('');
                                    }
                                }
                            >
                                {facilities.map(instalacion => (
                                    <option key={instalacion?._id} value={instalacion?._id}>
                                        {instalacion.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {instalacionCompleta && <p>Capacidad por reserva para {instalacionCompleta.nombre}: {instalacionCompleta.capacidad}</p>}
                    {selectedInstalacionId ? (
                        <>
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
                                    minTime={ minTime }
                                    maxTime={ maxTime}
                                    minDate={new Date()}
                                    role="datetime"
                                />
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
