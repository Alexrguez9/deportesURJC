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

  const openModal = (reservation) => {
    setPopupData(reservation || null); // Si no se pasa reserva, se abre en modo "nueva reserva"
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPopupData(null);
    fetchReservations(); // Actualiza la lista después de cerrar el modal
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
      console.error("Error al eliminar reserva:", error);
    }
  };

  if (!isAdmin()) {
    return <AccessDenied />;
  }

  return (
    <div id="component-content">
        {isLoading && <Spinner />}
        <Fragment>
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
                    {reservations.map((reservation) => (
                        <tr key={reservation?._id}>
                            <td>{reservation?.userId}</td>
                            <td>{reservation?.instalacionId}</td>
                            <td>{getPrettyDate(reservation?.fechaInicio)}</td>
                            <td>{getPrettyDate(reservation?.fechaFin)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {reservation?.precioTotal} €
                                  {reservation?.isPaid ? (
                                      <MdAttachMoney title="Pagado" style={{ marginLeft: '0.5rem', color: 'green', width: '1.5em', height: '1.5em' }} />
                                  ) : (
                                      <MdMoneyOff title="Pendiente de pago" style={{ marginLeft: '0.5rem', color: 'red', width: '1.5em', height: '1.5em' }} />
                                  )}
                              </div>
                            </td>
                            <td>
                            <GoPencil
                                onClick={() => openModal(reservation)}
                                className="editPencil"
                            />
                            <MdOutlineDelete
                                onClick={() => handleDeleteReservation(reservation?._id)}
                                className="deleteTrash"
                            />
                            <IoPersonOutline 
                                onClick={() => navigate(`/admin-panel/admin-usuarios/${reservation?.userId}`)}
                                className="infoButton"
                            />
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </section>
        </Fragment>
    </div>
  );
};

export default AdminReservations;
