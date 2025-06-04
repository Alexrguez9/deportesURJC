import { useState, useEffect, Fragment } from 'react';
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFacilitiesAndReservations } from '../../context/FacilitiesAndReservationsContext';
import { useAuth } from '../../context/AuthContext';
import './Facilities.css';
import { sendEmail } from '../../utils/mails';
import { getHoursAndMinutes, validateHours } from "../../utils/dates";
import {
    getMinTime,
    getMaxTime,
    generateTimeSlots,
    checkSubscriptionForFacility
} from '../../utils/facilities';

const Facilities = () => {
    const { user } = useAuth();
    const { getAllFacilities, addReservation, getFacility, countReservationsByTimeSlot } = useFacilitiesAndReservations();

    const [facilities, setFacilities] = useState([]);
    const [selectedInstalacionId, setSelectedInstalacionId] = useState('');
    const [completeFacility, setCompleteFacility] = useState({});
    const [minTime, setMinTime] = useState(new Date());
    const [maxTime, setMaxTime] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors: errorFacilities },
    } = useForm();

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const facilityList = await getAllFacilities();
                setFacilities(facilityList || []);
            } catch (error) {
                console.error("Error al obtener las instalaciones:", error);
            }
        };

        fetchFacilities();
    }, []);

    useEffect(() => {
        if (!selectedInstalacionId) return;

        const updateFacilityData = async () => {
            const inst = await getFacility(selectedInstalacionId);
            if (!inst) return;

            setCompleteFacility(inst);
            setMinTime(getMinTime(inst));
            setMaxTime(getMaxTime(inst));
        };

        updateFacilityData();
    }, [selectedInstalacionId]);

    /* istanbul ignore next */
    const handleReservation = async () => {
        if (!startDate) {
            toast.error('Por favor, selecciona una fecha de inicio.');
            return;
        }

        if (!validateHours(startDate, minTime, maxTime)) {
            toast.error('La hora seleccionada está fuera del horario de la instalación.');
            return;
        }

        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() === 30 ? 0 : 30);
        if (startDate.getMinutes() === 30) endDate.setHours(startDate.getHours() + 1);

        const reserva = {
            userId: user?._id,
            facilityId: selectedInstalacionId,
            initDate: startDate,
            endDate,
            totalPrice: completeFacility?.priceForHalfHour,
            isPaid: false,
        };

        const numReservations = await countReservationsByTimeSlot(selectedInstalacionId, startDate);

        toast.promise(
            async () => {
                if (numReservations >= completeFacility.capacity) {
                    throw new Error('Actualmente ya no hay reservas disponibles para esa hora.');
                }

                const response = await addReservation(reserva);
                if (!response.ok) throw new Error('Hubo un problema al realizar la reserva.');

                sendEmail(
                    user.email,
                    'DeportesURJC - Confirmación de reserva',
                    `Hola ${user.name},\n\n
                    Tu reserva de la instalación ${completeFacility.name} ha sido realizada con éxito.\n
                    Fecha: ${startDate}.\nPrecio total: ${completeFacility.priceForHalfHour}€.\n\n
                    Gracias por utilizar nuestro servicio.\nDeportes URJC`
                );
                toast.success(`Correo de confirmación enviado a: ${user.email}`);

                setStartDate(null);
                setSelectedDay(null);
                setTimeSlots([]);

                return { success: true };
            },
            {
                loading: 'Realizando reserva...',
                success: 'Reserva realizada con éxito!',
                error: (err) => err?.message || 'Error al realizar la reserva.',
                duration: 3000,
            }
        );
    };

    const onSubmit = () => handleReservation();

    return (
        <div id='component-content' className="content">
            <h1>Instalaciones</h1>
            <p>
                Recuerde que el pago de las instalaciones se debe efectuar <strong>en efectivo</strong> al llegar.<br />
                Las reservas son de media hora en media hora.
            </p>

            {user ? (
                <Fragment>
                    <form onSubmit={handleSubmit(onSubmit)} className="form-reservar">
                        <label>Instalación:&nbsp;
                            <select
                                {...register("facilityId", { required: "Por favor, selecciona un deporte" })}
                                value={selectedInstalacionId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const selected = facilities.find(f => f._id === id);

                                    if (!id || (selected && !checkSubscriptionForFacility(selected.name, user).ok)) {
                                        const result = checkSubscriptionForFacility(selected?.name, user);
                                        if (!result.ok) toast.warning(result.message);
                                        setSelectedInstalacionId('');
                                        setCompleteFacility({});
                                        return;
                                    }

                                    setSelectedInstalacionId(id);
                                }}
                            >
                                <option value="">Escoge una instalación</option>
                                {facilities.map(facility => (
                                    <option key={facility?._id} value={facility?._id}>{facility.name}</option>
                                ))}
                            </select>
                        </label>

                        {completeFacility?.schedule && (
                            <div className="facility-details">
                                <p>
                                    Horario inicio: {getHoursAndMinutes(completeFacility.schedule.initialHour)}<br />
                                    Horario fin: {getHoursAndMinutes(completeFacility.schedule.endHour)}
                                </p>
                                <p>Precio por media hora: {completeFacility?.priceForHalfHour}€.</p>
                                <p>Capacidad por reserva para {completeFacility.name}: {completeFacility.capacity}</p>
                            </div>
                        )}

                        {selectedInstalacionId && (
                            <>
                                <label>Fecha Inicio:</label>
                                <DatePicker
                                    selected={selectedDay}
                                    onChange={async (date) => {
                                        setSelectedDay(date);
                                        const slots = await generateTimeSlots(completeFacility, date, countReservationsByTimeSlot);
                                        setTimeSlots(slots);
                                    }}
                                    dateFormat="d MMMM yyyy"
                                    minDate={new Date()}
                                    placeholderText="Selecciona una fecha"
                                />
                                <button type="submit">Reservar</button>
                            </>
                        )}
                    </form>

                    {timeSlots.length > 0 && (
                        <div className="slot-grid">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot.time}
                                    disabled={!slot.available}
                                    className={`slot ${slot.available ? "available" : "unavailable"} ${
                                        startDate?.getTime() === slot.date.getTime() ? "selected" : ""
                                    }`}
                                    onClick={() => setStartDate(slot.date)}
                                    title={`${slot.remaining} huecos disponibles`}
                                >
                                    <span>{slot.time}</span>
                                    <br />
                                    <small style={{ fontSize: '0.75rem', color: '#666' }}>
                                        {`${completeFacility.capacity - slot.remaining}/${completeFacility.capacity}`}
                                    </small>
                                </button>
                            ))}
                        </div>
                    )}
                </Fragment>
            ) : (
                <p>Debes iniciar sesión para reservar</p>
            )}
        </div>
    );
};

export default Facilities;
