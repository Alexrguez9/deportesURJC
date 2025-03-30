import PropTypes from "prop-types";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { MdAttachMoney, MdMoneyOff } from "react-icons/md";
import { useForm } from "react-hook-form";
import "./AdminModalReservations.css";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const AdminModalReservations = ({ closeModal, popupData }) => {
  const { addReservation, updateReservation } = useFacilitiesAndReservations();

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16).replace("Z", "");
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: popupData
      ? {
        ...popupData,
        initDate: formatDateForInput(popupData.initDate),
        endDate: formatDateForInput(popupData.endDate),
      }
      : {
        userId: "",
        facilityId: "",
        initDate: "",
        endDate: "",
        totalPrice: 0,
        isPaid: false,
      },
  });

  const onSubmit = async (data) => {
    try {
      const reservationData = {
        ...data,
        initDate: new Date(data.initDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      
      if (reservationData.endDate <= reservationData.initDate) {
        toast.error("La fecha de fin debe ser posterior a la fecha de inicio.");
        return;
      }

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
                {...register("facilityId", { required: "Introduce un ID de instalación válido" })}
              />
              {errors.facilityId && <span className="error-message">{errors.facilityId.message}</span>}
            </label>
          </div>
          <div className="input-container">
            <label>
              Fecha inicio:
              <input
                type="datetime-local"
                {...register("initDate", { required: "Introduce una fecha de inicio" })}
              />
              {errors.initDate && (
                <span className="error-message">{errors.initDate.message}</span>
              )}
            </label>
          </div>
          <div className="input-container">
            <label>
              Fecha fin:
              <input
                type="datetime-local"
                {...register("endDate", { required: "Introduce una fecha de fin" })}
              />
              {errors.endDate && <span className="error-message">{errors.endDate.message}</span>}
            </label>
          </div>
          <div className="input-container">
            <label>
              Precio total:
              <input
                type="number"
                {...register("totalPrice", {
                  required: "Introduce un precio total",
                  min: { value: 0, message: "El precio no puede ser negativo" },
                })}
              />
              {errors.totalPrice && (
                <span className="error-message">{errors.totalPrice.message}</span>
              )}
            </label>
          </div>
          <div className="input-container">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'column' }}>
            <input type="checkbox" {...register("isPaid")} aria-label="isPaid" />
            {/* Opcional: Icono visual */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>Reserva pagada</span>
              {watch("isPaid") ? (
                <MdAttachMoney title="Pagado" color="green" style={{ marginLeft: '0.5rem', width: '1.5em', height: '1.5em'  }} />
              ) : (
                <MdMoneyOff title="Pendiente de pago" color="red" style={{ marginLeft: '0.5rem', width: '1.5em', height: '1.5em'  }}/>
              )}
            </div>
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
    facilityId: PropTypes.string,
    initDate: PropTypes.string,
    endDate: PropTypes.string,
    totalPrice: PropTypes.number,
    isPaid: PropTypes.bool,
  }),
};

export default AdminModalReservations;
