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
  const { isAdmin } = useAuth();
  const { getAllReservations, deleteReservation } = useFacilitiesAndReservations();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [maxPageButtons, setMaxPageButtons] = useState(5);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 10;
  const totalPages = Math.ceil(reservations.length / reservationsPerPage);

  const paginatedReservations = reservations.slice(
    (currentPage - 1) * reservationsPerPage,
    currentPage * reservationsPerPage
  );

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const reservationList = await getAllReservations();
      setReservations(reservationList || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    }
  };

  useEffect(() => {
    if (isAdmin()) fetchReservations();
  }, []);

  useEffect(() => {
    const updateMaxButtons = () => {
      if (window.innerWidth <= 600) {
        setMaxPageButtons(3); // Reduce buttons on small screens
      } else {
        setMaxPageButtons(5);
      }
    };
  
    updateMaxButtons(); // for initial load
    window.addEventListener("resize", updateMaxButtons);
  
    return () => window.removeEventListener("resize", updateMaxButtons);
  }, []);

  const openModal = (reservation) => {
    setPopupData(reservation || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPopupData(null);
    fetchReservations();
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      const deleteRes = await deleteReservation(reservationId);
      if (!deleteRes.ok) {
        toast.error("Error al eliminar la reserva.");
        return;
      }
      toast.success("Reserva eliminada correctamente");
      fetchReservations();
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
                  <td>{reservation.userId}</td>
                  <td>{reservation.facilityId}</td>
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
                    <IoPersonOutline onClick={() => navigate(`/admin-panel/admin-usuarios/${reservation.userId}`)} className="infoButton" />
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
