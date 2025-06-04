import { useState, useEffect, Fragment } from "react";
import { toast } from 'sonner';
import "./AdminReservations.css";
import { MdAttachMoney, MdMoneyOff } from "react-icons/md";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import AdminModalReservations from "../../../../components/adminModal/adminModalReservations/AdminModalReservations";
import BackButton from "../../../../components/backButton/BackButton";
import AccessDenied from "../../../../components/accessDenied/AccessDenied";
import Spinner from "../../../../components/spinner/Spinner";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { getPrettyDate } from "../../../../utils/dates";

const AdminReservations = () => {
    const { isAdmin, getAllUsers } = useAuth();
    const { getAllReservations, deleteReservation, getAllFacilities } = useFacilitiesAndReservations();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [maxPageButtons, setMaxPageButtons] = useState(5);
    const [users, setUsers] = useState([]);
    const [facilities, setFacilities] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const reservationsPerPage = 10;
    const totalPages = Math.ceil(reservations.length / reservationsPerPage);

    const paginatedReservations = reservations.slice(
        (currentPage - 1) * reservationsPerPage,
        currentPage * reservationsPerPage
    );

    const reloadReservations = async () => {
        try {
            const data = await getAllReservations();
            setReservations(data || []);
        } catch (err) {
            console.error("Error al recargar reservas:", err);
            toast.error("Error al recargar las reservas.");
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!isAdmin()) return;

            try {
                setIsLoading(true);

                const [usersData, facilitiesData, reservationsData] = await Promise.all([
                    getAllUsers(),
                    getAllFacilities(),
                    getAllReservations()
                ]);

                setUsers(usersData || []);
                setFacilities(facilitiesData || []);
                setReservations(reservationsData || []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                toast.error("Error al cargar los datos");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        const updateMaxButtons = () => {
            setMaxPageButtons(window.innerWidth <= 600 ? 3 : 5);
        };

        updateMaxButtons(); // initial
        window.addEventListener("resize", updateMaxButtons);

        return () => window.removeEventListener("resize", updateMaxButtons);
    }, []);


    const getUserName = (userId) => {
        const user = users.find((u) => u._id === userId);
        return user?.name || "Desconocido";
    };

    const getFacilityName = (facilityId) => {
        const facility = facilities.find((f) => f._id === facilityId);
        return facility?.name || "Desconocida";
    };


    const openModal = (reservation) => {
        setPopupData(reservation || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPopupData(null);
        reloadReservations();
    };

    const handleDeleteReservation = async (reservationId) => {
        try {
            const deleteRes = await deleteReservation(reservationId);
            if (!deleteRes.ok) {
                toast.error("Error al eliminar la reserva.");
                return;
            }
            toast.success("Reserva eliminada correctamente");
            reloadReservations();
        } catch (error) {
            toast.error("Error al eliminar reserva.");
        }
    };

    const getVisiblePages = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = startPage + maxPageButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (!isAdmin()) return <AccessDenied />;

    return (
        <div id="component-content">
            {isLoading && <Spinner />}
            <>
                {isModalOpen && (
                    <AdminModalReservations
                        closeModal={closeModal}
                        isOpen={isModalOpen}
                        popupData={popupData}
                    />
                )}
                <div className="top-buttons-content">
                    <BackButton />
                    <GoPlus onClick={() => openModal()} className="iconPlus" size="1.5em" />
                </div>
                <h1>Reservas</h1>
                <p>Aquí puedes administrar las reservas realizadas en la web.</p>

                <section>
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Instalación</th>
                                <th>Fecha inicio</th>
                                <th>Fecha fin</th>
                                <th>Precio total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReservations.map((reservation) => (
                                <tr key={reservation._id}>
                                    <td>{getUserName(reservation.userId)}</td>
                                    <td>{getFacilityName(reservation.facilityId)}</td>
                                    <td>{getPrettyDate(reservation.initDate)}</td>
                                    <td>{getPrettyDate(reservation.endDate)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {reservation.totalPrice} €
                                            {reservation.isPaid ? (
                                                <MdAttachMoney title="Pagado" style={{ marginLeft: '0.5rem', color: 'green' }} />
                                            ) : (
                                                <MdMoneyOff title="Pendiente de pago" style={{ marginLeft: '0.5rem', color: 'red' }} />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <GoPencil onClick={() => openModal(reservation)} className="editPencil" />
                                        <MdOutlineDelete onClick={() => handleDeleteReservation(reservation._id)} className="deleteTrash" />
                                        <IoPersonOutline
                                            title="Ver detalles del usuario"
                                            onClick={() => navigate(`/admin-panel/admin-usuarios/${reservation.userId}`)}
                                            className="infoButton"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-prev"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <span className="button-text">Anterior</span>
                            </button>

                            {getVisiblePages().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={page === currentPage ? 'active' : ''}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="pagination-next"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <span className="button-text">Siguiente</span>
                            </button>
                        </div>
                    )}
                </section>
            </>
        </div>
    );
};

export default AdminReservations;
