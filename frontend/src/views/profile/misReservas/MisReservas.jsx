import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './MisReservas.css';
import { MdAttachMoney, MdMoneyOff } from "react-icons/md";
import { useAuth } from '../../../context/AuthContext';
import { useFacilitiesAndReservations } from '../../../context/FacilitiesAndReservationsContext';
import { getPrettyDate } from '../../../utils/dates';

const MisReservas = () => {
    const { user } = useAuth();
    const { instalaciones, deleteReservation, getAllReservations } = useFacilitiesAndReservations();
    const [filteredReservas, setFilteredReservas] = useState([]);

    const fetchReservas = async () => {
        const reservations = await getAllReservations();
        if (user) {
            setFilteredReservas(reservations?.filter(reserva => reserva.userId === user._id));
        }
    };

    useEffect(() => {
        fetchReservas();
        console.log('---filteredReservas---', filteredReservas);
        console.log('---instalaciones---', instalaciones);
    }, []);

    const handleRemoveReserva = async (reservaId) => {
        try {
            const res = await deleteReservation(reservaId);
            if (!res || res.status !== 200) {
                toast.error('Error al eliminar la reserva. Inténtalo de nuevo.');
                return;
            } else {
                toast.success('Reserva eliminada correctamente');
            }
            fetchReservas();
        } catch (error) {
            toast.error('Error al eliminar la reserva. Inténtalo de nuevo.');
        }
    };

    return (
        <div>
            <h1>Mis Reservas</h1>
            <div className='content-mis-reservas'>
                {user ? ( 
                    filteredReservas.length <= 0  ? ( 
                        <p>No tienes reservas.</p> 
                    ) : (
                        <>
                            <table className="table-mis-reservas">
                                <thead>
                                    <tr>
                                        <th>Instalación</th>
                                        <th>Fecha inicio</th>
                                        <th>Fecha fin</th>
                                        <th>Precio total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservas.map((reserva) => (
                                        <tr key={reserva._id}>
                                            <td>{instalaciones.find(instalacion => instalacion._id === reserva.facilityId)?.name}</td>
                                            <td>{getPrettyDate(reserva.initDate)}</td>
                                            <td>{getPrettyDate(reserva.endDate)}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {reserva.totalPrice} €
                                                    {reserva.isPaid ? (
                                                        <MdAttachMoney title="Pagado" style={{ marginLeft: '0.5rem', color: 'green', width: '1.5em', height: '1.5em' }} />
                                                    ) : (
                                                        <MdMoneyOff title="Pendiente de pago" style={{ marginLeft: '0.5rem', color: 'red', width: '1.5em', height: '1.5em' }} />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleRemoveReserva(reserva._id)} className='delete-button'>
                                                    Eliminar reserva
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ))
                : <p>Inicia sesión para acceder a tus reservas</p>}
            </div>
        </div>
    );
};

export default MisReservas;