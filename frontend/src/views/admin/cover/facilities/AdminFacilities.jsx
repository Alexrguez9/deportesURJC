import { useState, useEffect, Fragment } from "react";
import { toast } from "sonner";
import "./AdminFacilities.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import AdminModalFacilities from "../../../../components/adminModal/adminModalFacilities/AdminModalFacilities";
import { useAuth } from "../../../../context/AuthContext";
import BackButton from "../../../../components/backButton/BackButton";
import Spinner from "../../../../components/spinner/Spinner";
import AccessDenied from "../../../../components/accessDenied/AccessDenied";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { getHoursAndMinutes } from "../../../../utils/dates";

const AdminFacilities = () => {
  const { isAdmin } = useAuth();
  const { getAllFacilities, deleteFacility } = useFacilitiesAndReservations();
  const [facilities, setFacilities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const facilityList = await getAllFacilities();
      setFacilities(facilityList || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener las instalaciones:", error);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchFacilities();
    }
  }, []);

  const openModal = (facility) => {
    setPopupData(facility || null); // Edition mode if passed a facility
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPopupData(null);
    fetchFacilities(); // Refresh facilities list
  };

  const handleDeleteFacility = async (facilityId) => {
    try {
      const deleteRes = await deleteFacility(facilityId);
      if (!deleteRes.ok) {
        toast.error("Error al eliminar la instalación.");
        return;
      }
      toast.success("Instalación eliminada correctamente");
      fetchFacilities();
    } catch (error) {
      console.error("Error al eliminar la instalación:", error);
      toast.error("Error al eliminar la instalación.");
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
          <AdminModalFacilities
            closeModal={closeModal}
            isOpen={isModalOpen}
            popupData={popupData}
          />
        )}
        <div className="top-buttons-content">
          <BackButton />
          <GoPlus onClick={() => openModal()} className="iconPlus" size="1.5em" />
        </div>
        <h1>Instalaciones</h1>
        <p>Aquí puedes administrar las instalaciones disponibles en la web.
          <br />Los precios son por media hora.
        </p>
        <section>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Capacidad</th>
                <th>Horario inicio</th>
                <th>Horario fin</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility._id}>
                  <td>{facility.name}</td>
                  <td>{facility.description}</td>
                  <td>{facility.capacity}</td>
                  <td>{getHoursAndMinutes(facility?.schedule?.initialHour)}</td>
                  <td>{getHoursAndMinutes(facility?.schedule?.endHour)}</td>
                  <td>{facility.priceForHalfHour} €</td>
                  <td>
                    <GoPencil
                      onClick={() => openModal(facility)}
                      className="editPencil"
                    />
                    <MdOutlineDelete
                      onClick={() => handleDeleteFacility(facility._id)}
                      className="deleteTrash"
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

export default AdminFacilities;
