import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './MisReservas.css';
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
            setFilteredReservas(reservations.filter(reserva => reserva.userId === user._id));
        }
    };

    useEffect(() => {
        fetchReservas();
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservas.map((reserva) => (
                                        <tr key={reserva._id}>
                                            <td>{instalaciones.find(instalacion => instalacion._id === reserva.instalacionId)?.nombre}</td>
                                            <td>{getPrettyDate(reserva.fechaInicio)}</td>
                                            <td>{getPrettyDate(reserva.fechaFin)}</td>
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
                        </>
                    ))
                : <p>Inicia sesión para acceder a tus reservas</p>}
            </div>
        </div>
    );
};

export default MisReservas;