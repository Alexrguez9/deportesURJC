import { useState, useEffect } from "react";
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
        horarioInicio: popupData.horario?.horarioInicio
          ? new Date(popupData.horario.horarioInicio).toISOString().slice(0, 16).replace("Z", "")
          : "",
        horarioFin: popupData.horario?.horarioFin
          ? new Date(popupData.horario.horarioFin).toISOString().slice(0, 16).replace("Z", "")
          : "",
      }
      : {
        nombre: "",
        descripcion: "",
        capacidad: 0,
        precioPorMediaHora: 0,
        isInternSport: false,
        horarioInicio: "",
        horarioFin: "",
      },
  });


  useEffect(() => {
  }, []);

  const onSubmit = async (data) => {
    try {
      const facilityData = {
        ...data,
        isInternSport: data.isInternSport === "true", // Convertir a booleano
        horario: {
          horarioInicio: new Date(data.horarioInicio + "Z"), // Convertir a Date, manteneniendo la zona horaria local
          horarioFin: new Date(data.horarioFin + "Z"), // Convertir a Date, manteneniendo la zona horaria local
        },
      };
      console.log('---facilityData---', facilityData);

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
        console.log('---addRes---', addRes);
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
              <input type="text" {...register("nombre", { required: "Introduce un nombre válido" })} />
              {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Descripción:
              <textarea {...register("descripcion", { required: "Introduce una descripción válida" })} />
              {errors.descripcion && <span className="error-message">{errors.descripcion.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Capacidad:
              <input
                type="number"
                {...register("capacidad", {
                  required: "Introduce una capacidad válida",
                  min: { value: 1, message: "La capacidad debe ser mayor a 0" },
                })}
              />
              {errors.capacidad && <span className="error-message">{errors.capacidad.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Precio por 30 minutos:
              <input
                type="number"
                {...register("precioPorMediaHora", {
                  required: "Introduce un precio válido",
                  min: { value: 0, message: "El precio no puede ser negativo" },
                })}
              />
              {errors.precioPorMediaHora && <span className="error-message">{errors.precioPorMediaHora.message}</span>}
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
              <input type="datetime-local" {...register("horarioInicio", { required: "Selecciona un horario de inicio" })} />
              {errors.horarioInicio && <span className="error-message">{errors.horarioInicio.message}</span>}
            </label>
          </div>

          <div className="input-container">
            <label>
              Horario de Fin:
              <input type="datetime-local" {...register("horarioFin", { required: "Selecciona un horario de fin" })} />
              {errors.horarioFin && <span className="error-message">{errors.horarioFin.message}</span>}
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
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    capacidad: PropTypes.number,
    precioPorMediaHora: PropTypes.number,
    isInternSport: PropTypes.bool,
    horario: PropTypes.shape({
      horarioInicio: PropTypes.string,
      horarioFin: PropTypes.string,
    }),
  }),
};

export default AdminModalFacilities;
