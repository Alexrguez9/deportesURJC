import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFacilitiesAndReservations } from '../../context/FacilitiesAndReservationsContext';
import { useAuth } from '../../context/AuthContext';
import './Facilities.css';
import { sendEmail } from '../../utils/mails';
import { getHoursAndMinutes, validateHours } from "../../utils/dates";

const Facilities = () => {
    const { user } = useAuth();
    const { getAllFacilities, addReservation, getFacility, countReservationsByTimeSlot } = useFacilitiesAndReservations();
    const [facilities, setFacilities] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [selectedInstalacionId, setSelectedInstalacionId] = useState('');
    const [completeFacility, setCompleteFacility] = useState({});
    const [minTime, setMinTime] = useState(new Date());
    const [maxTime, setMaxTime] = useState(new Date());

    const {
        register,
        handleSubmit,
        formState: { errors: errorFacilities },
    } = useForm({
        userId: user?._id || '',
        facilityId: selectedInstalacionId || '',
        initDate: '',
        endDate: '',
        totalPrice: completeFacility?.priceForHalfHour || 0,
        isPaid: false,
    });

    //TODO: optimizar las llamadas a getFacility (3 veces: en getCompleteFacility, getMinTime y getMaxTime)

    const fetchFacilities = async () => {
        try {
            const facilityList = await getAllFacilities();
            await setFacilities(facilityList || []);
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


    const getCompleteFacility = async (id) => {
        const inst = await getFacility(id);
        await setCompleteFacility(inst);
    }

    const getMinTime = async () => {
        if (!selectedInstalacionId) return new Date();

        const inst = await getFacility(selectedInstalacionId);
        /* istanbul ignore next */
        if (!inst || !inst.schedule || !inst.schedule.initialHour) {
            console.error("Error: Instalación sin horario válido", inst);
            return new Date();
        }

        const startTime = new Date(inst.schedule.initialHour);
        /* istanbul ignore if */
        if (isNaN(startTime.getTime())) {
            console.error("Error: La fecha no es válida", startTime);
            return new Date();
        }

        startTime.setHours(startTime.getUTCHours());
        return startTime;
    };

    const getMaxTime = async () => {
        if (!selectedInstalacionId) {
            /* istanbul ignore next */
            return new Date();
        } else if (selectedInstalacionId) {
            const inst = await getFacility(selectedInstalacionId);

            const startTime = new Date(inst?.schedule?.endHour);
            let hours = startTime.getUTCHours();
            let minutes = startTime.getUTCMinutes();

            // If it ends at 30 o'clock, the maximum time to book is half an hour before.
            if (minutes == 30) {
                minutes = 0;
            } else if (minutes == 0) {
                minutes = 30;
                hours = hours - 1;
            }

            startTime.setHours(hours, minutes, 0);

            return startTime;
        } else {
            /* istanbul ignore next */
            return new Date();
        }
    };

    const onSubmit = (data) => {
        handleReservation(data);
    };
    /* istanbul ignore next */
    const handleReservation = async (data) => {
        if(!startDate) {
            toast.error('Por favor, selecciona una fecha de inicio.');
            return;
        }

        if (!validateHours(startDate, minTime, maxTime)) {
            toast.error('La hora seleccionada está fuera del horario de la instalación. Por favor, selecciona otra hora.');
            return;
        }

        await getCompleteFacility(data.facilityId);

        let endDate = new Date(startDate);
        if (endDate.getMinutes() == 30) {
            endDate.setHours(endDate.getHours() + 1);
            endDate.setMinutes(0);
        } else if (endDate.getMinutes() == 0) {
            endDate.setMinutes(30);
        }

        // TODO: ver que hacer con totalPrice
        const reserva = {
            userId: user?._id,
            facilityId: selectedInstalacionId,
            initDate: startDate,
            endDate: endDate,
            totalPrice: completeFacility?.priceForHalfHour,
            isPaid: false,
        };

        const numReservations = await countReservationsByTimeSlot(selectedInstalacionId, startDate);
        toast.promise(
            async () => {
                if (numReservations >= completeFacility.capacity) {
                    throw { status: { ok: false, error: 'Actualmente ya no hay reservas disponibles para esa hora. Por favor, selecciona otra hora.' } };
                }

                try {
                    const response = await addReservation(reserva);
                    if (!response.ok) {
                        throw { status: { ok: false, error: 'Hubo un problema al realizar la reserva. Inténtalo de nuevo.' } };
                    } else {
                        sendEmail(
                            user.email,
                            'DeportesURJC - Confirmación de reserva',
                            `Hola ${user.name},\n\n` +
                            `Tu reserva de la instalación ${completeFacility.name} ha sido realizada con éxito.\nFecha: ${startDate}.\nPrecio total: ${completeFacility.priceForHalfHour}€.\n¡Nos vemos pronto!\n\n` +
                            `Gracias por utilizar nuestro servicio.\nDeportes URJC`
                        );
                        toast.success('Correo de confirmación enviado a: ' + user.email);
                        return { success: true };
                    }
                } catch (error) {
                    /* istanbul ignore next */
                    console.error("Error al realizar la reserva:", error);
                    throw { status: { ok: false, error: 'Hubo un problema al realizar la reserva. Inténtalo de nuevo.' } };
                }
            },
            {
                loading: 'Realizando reserva...',
                success: 'Reserva realizada con éxito!',
                error: (err) => {
                    return err?.status?.error || 'Error al realizar la reserva. Inténtalo de nuevo más tarde.';
                },
                duration: 3000,
            }
        );
    };

    const checkSubscriptionForFacility = (facilityName) => {
        if (facilityName === 'Gimnasio' && !user?.subscription?.gym?.isActive) {
          toast.warning('No tienes una suscripción activa en Gimnasio.');
          return false;
        }
      
        if (facilityName === 'Atletismo' && !user?.subscription?.athletics?.isActive) {
          toast.warning('No tienes una suscripción activa en Atletismo.');
          return false;
        }
        return true;
    };

    return (
        <div className="content">
            <h1>Instalaciones</h1>
            <p>Selecciona una instalación y una fecha para reservar.
                <br />Recuerde que el pago de las instalaciones se debe efectuar en efectivo al llegar.
                <br />Las reservas son de media hora en media hora.
            </p>
            {user ?
                <form onSubmit={handleSubmit(onSubmit)} className="form-reservar" data-testid="reservation-form">
                    <div>
                        <label>Instalación:
                            <select
                                {...register("facilityId", { required: "Por favor, selecciona un deporte" })}
                                value={selectedInstalacionId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedInstalacionId(value);

                                    if (value === '') {
                                        setCompleteFacility({});
                                        return;
                                      }
                                    const selectedFacility = facilities.find(f => f._id === value);
                                    if (!checkSubscriptionForFacility(selectedFacility?.name)) {
                                        // Reset the selected installation if the user doesn't have a subscription
                                        setSelectedInstalacionId('');
                                        return;
                                    }

                                    getMinTime(); // update minTime
                                    getMaxTime(); // update maxTime
                                    getCompleteFacility(e.target.value);
                                }
                                }
                            >
                                <option value="">Escoge una instalación</option>
                                {facilities.map(facility => (
                                    <option key={facility?._id} value={facility?._id}>
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div>
                        {completeFacility && completeFacility.schedule ? (
                            <>
                                Horario de inicio: {completeFacility.schedule.initialHour ? getHoursAndMinutes(completeFacility.schedule.initialHour) : 'No definido'}<br />
                                Horario de fin: {completeFacility.schedule.endHour ? getHoursAndMinutes(completeFacility.schedule.endHour) : 'No definido'}
                            </>
                        ) : (
                        <p>Selecciona una instalación para ver el horario.</p>
                        )}

                        {selectedInstalacionId && (<p>Precio por media hora: {completeFacility?.priceForHalfHour}€.</p>)}
                        {selectedInstalacionId && completeFacility?.capacity !== undefined && (
                            <p>Capacidad por reserva para {completeFacility.name}: {completeFacility.capacity}</p>
                        )}
                    </div>

                    {selectedInstalacionId ? (
                        <>
                            <label>Fecha Inicio:</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                }
                                }
                                //locale="es-ES"
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                                timeCaption="time"
                                dateFormat="d MMMM, yyyy - HH:mm"
                                minTime={minTime}
                                maxTime={maxTime}
                                minDate={new Date()}
                                className="date-picker"
                            />
                            <button type="submit">Reservar</button>
                        </>
                    ) : (<p></p>)
                    }
                </form>
                : <p>Debes iniciar sesión para reservar</p>}
        </div>
    );
};

export default Facilities;
