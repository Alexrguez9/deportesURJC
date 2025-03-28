import { useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import "./AdminModalFacilities.css";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const AdminModalFacilities = ({ closeModal, popupData }) => {
  const { addFacility, updateFacility } = useFacilitiesAndReservations();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: popupData
      ? {
        ...popupData,
        initialHour: popupData.schedule?.initialHour
          ? new Date(popupData.schedule.initialHour).toISOString().slice(0, 16).replace("Z", "")
          : "",
        endHour: popupData.schedule?.endHour
          ? new Date(popupData.schedule.endHour).toISOString().slice(0, 16).replace("Z", "")
          : "",
      }
      : {
        name: "",
        description: "",
        capacity: 0,
        priceForHalfHour: 0,
        isInternSport: false,
        initialHour: "",
        endHour: "",
      },
  });


  useEffect(() => {
  }, []);

  const onSubmit = async (data) => {
    try {
      const facilityData = {
        ...data,
        isInternSport: data.isInternSport === "true", // Convert to boolean
        schedule: {
          initialHour: new Date(data.initialHour + "Z"), // Convert to Date, keeping the local time zone
          endHour: new Date(data.endHour + "Z"), // Convert to Date, keeping the local time zone
        },
      };

      if (popupData?._id) {
        const updateRes = await updateFacility(popupData._id, facilityData);
        if (!updateRes.ok) {
          toast.error("Error al editar la instalación.");
          return;
        } else {
          toast.success("Instalación editada correctamente");
        }
      } else {
        const addRes = await addFacility(facilityData);
        if (!addRes.ok) {
          toast.error("Error al guardar la instalación.");
          return;
        } else {
          toast.success("Instalación guardada correctamente");
        }
      }
      closeModal();

    } catch (error) {
      toast.error("Error al procesar el formulario de instalaciones.");
      console.error("Error en el formulario de instalaciones:", error);
    }
  };

  return (
    <div id="admin-modal">
      <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
      <h2>{popupData ? "Editar instalación" : "Nueva instalación"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="inputs">
          <div className="input-container">
            <label>
              Nombre:
              <input type="text" {...register("name", { required: "Introduce un nombre válido" })} />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Descripción:
              <textarea {...register("description", { required: "Introduce una descripción válida" })} />
              {errors.description && <span className="error-message">{errors.description.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Capacidad:
              <input
                type="number"
                {...register("capacity", {
                  required: "Introduce una capacidad válida",
                  min: { value: 1, message: "La capacidad debe ser mayor a 0" },
                })}
              />
              {errors.capacity && <span className="error-message">{errors.capacity.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Precio por 30 minutos:
              <input
                type="number"
                {...register("priceForHalfHour", {
                  required: "Introduce un precio válido",
                  min: { value: 0, message: "El precio no puede ser negativo" },
                })}
              />
              {errors.priceForHalfHour && <span className="error-message">{errors.priceForHalfHour.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              ¿Deporte interno?:&nbsp;
              <select {...register("isInternSport")}>
                <option value={true}>Sí</option>
                <option value={false}>No</option>
              </select>
            </label>
          </div>

          <div className="input-container">
            <label>
              Horario de Inicio:
              <input type="datetime-local" {...register("initialHour", { required: "Selecciona un horario de inicio" })} />
              {errors.initialHour && <span className="error-message">{errors.initialHour.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Horario de Fin:
              <input type="datetime-local" {...register("endHour", { required: "Selecciona un horario de fin" })} />
              {errors.endHour && <span className="error-message">{errors.endHour.message}</span>}
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

AdminModalFacilities.propTypes = {
  closeModal: PropTypes.func.isRequired,
  popupData: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    capacity: PropTypes.number,
    priceForHalfHour: PropTypes.number,
    isInternSport: PropTypes.bool,
    schedule: PropTypes.shape({
      initialHour: PropTypes.string,
      endHour: PropTypes.string,
    }),
  }),
};

export default AdminModalFacilities;
