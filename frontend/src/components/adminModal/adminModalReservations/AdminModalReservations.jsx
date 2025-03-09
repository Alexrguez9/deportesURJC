import PropTypes from "prop-types";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import "./AdminModalReservations.css";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const AdminModalReservations = ({ closeModal, popupData }) => {
  const { addReservation, updateReservation } = useFacilitiesAndReservations();

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16).replace("Z", ""); // Eliminar "Z" para evitar UTC
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: popupData
      ? {
        ...popupData,
        fechaInicio: formatDateForInput(popupData.fechaInicio),
        fechaFin: formatDateForInput(popupData.fechaFin),
      }
      : {
        userId: "",
        instalacionId: "",
        fechaInicio: "",
        fechaFin: "",
        precioTotal: 0,
      },
  });

  const onSubmit = async (data) => {
    try {
      const reservationData = {
        ...data,
        fechaInicio: new Date(data.fechaInicio + "Z"), // Agregar "Z" para conservar la zona horaria local
        fechaFin: new Date(data.fechaFin + "Z"),
      };

      if (popupData?._id) {
        const updateRes = await updateReservation(popupData._id, reservationData);
        if (!updateRes.ok) {
          toast.error("Error al editar la reserva.");
          return;
        } else {
          toast.success("Reserva editada correctamente");
        }
      } else {
        const addRes = await addReservation(reservationData);
        if (!addRes.ok) {
          toast.error("Error al guardar la reserva.");
          return;
        } else {
          toast.success("Reserva guardada correctamente");
        }
      }
      closeModal();
    } catch (error) {
      toast.error("Error al procesar el formulario de reservas.");
      console.error("Error en el formulario de reservas:", error);
    }
  };

  return (
    <div id="admin-modal">
      <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
      <h2>{popupData ? "Editar reserva" : "Nueva reserva"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="inputs">
          <div className="input-container">
            <label>
              Usuario ID:
              <input
                type="text"
                {...register("userId", { required: "Introduce un ID de usuario válido" })}
              />
              {errors.userId && <span className="error-message">{errors.userId.message}</span>}
            </label>
          </div>
          <div className="input-container">
            <label>
              Instalación ID:
              <input
                type="text"
                {...register("instalacionId", { required: "Introduce un ID de instalación válido" })}
              />
              {errors.instalacionId && <span className="error-message">{errors.instalacionId.message}</span>}
            </label>
          </div>
          <div className="input-container">
            <label>
              Fecha inicio:
              <input
                type="datetime-local"
                {...register("fechaInicio", { required: "Introduce una fecha de inicio" })}
              />
              {errors.fechaInicio && (
                <span className="error-message">{errors.fechaInicio.message}</span>
              )}
            </label>
          </div>
          <div className="input-container">
            <label>
              Fecha fin:
              <input
                type="datetime-local"
                {...register("fechaFin", { required: "Introduce una fecha de fin" })}
              />
              {errors.fechaFin && <span className="error-message">{errors.fechaFin.message}</span>}
            </label>
          </div>
          <div className="input-container">
            <label>
              Precio total:
              <input
                type="number"
                {...register("precioTotal", {
                  required: "Introduce un precio total",
                  min: { value: 0, message: "El precio no puede ser negativo" },
                })}
              />
              {errors.precioTotal && (
                <span className="error-message">{errors.precioTotal.message}</span>
              )}
            </label>
          </div>
        </div>
        <div>
          <button type="submit" className="button-light">Guardar</button>
        </div>
      </form>
    </div>
  );
};


AdminModalReservations.propTypes = {
  closeModal: PropTypes.func.isRequired,
  popupData: PropTypes.shape({
    _id: PropTypes.string,
    userId: PropTypes.string,
    instalacionId: PropTypes.string,
    fechaInicio: PropTypes.string,
    fechaFin: PropTypes.string,
    precioTotal: PropTypes.number,
  }),
};

export default AdminModalReservations;
