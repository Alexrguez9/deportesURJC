import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './MyReservations.css';
import { MdAttachMoney, MdMoneyOff } from "react-icons/md";
import { useAuth } from '../../../context/AuthContext';
import { useFacilitiesAndReservations } from '../../../context/FacilitiesAndReservationsContext';
import { getPrettyDate } from '../../../utils/dates';
import BackButton from '../../../components/backButton/BackButton';

const MyReservations = () => {
    const { user } = useAuth();
    const { facilities, deleteReservation, getAllReservations } = useFacilitiesAndReservations();
    const [filteredReservations, setFilteredReservations] = useState([]);

    // 🔸 Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchReservas = async () => {
        const reservations = await getAllReservations();
        if (user) {
            setFilteredReservations(reservations?.filter(reserva => reserva.userId === user._id));
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

    // 🔸 Cálculo de páginas
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentReservations = filteredReservations.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

    return (
        <div id="component-content" className="content">
            <div className="top-buttons-content">
                <BackButton />
            </div>
            <h1>Mis Reservas</h1>
            <div className='content-mis-reservas'>
                {user ? (
                    filteredReservations.length <= 0 ? (
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
                                    {currentReservations.map((reserva) => (
                                        <tr key={reserva._id}>
                                            <td>{facilities.find(facility => facility._id === reserva.facilityId)?.name}</td>
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

                            {/* 🔸 Controles de paginación */}
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>
                                <span>Página {currentPage} de {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )
                ) : (
                    <p>Inicia sesión para acceder a tus reservas</p>
                )}
            </div>
        </div>
    );
};

export default MyReservations;
