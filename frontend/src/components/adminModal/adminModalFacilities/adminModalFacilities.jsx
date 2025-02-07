import React, { useState,useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import "./AdminModalFacilities.css";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const AdminModalFacilities = ({ closeModal, popupData }) => {
  const { addFacility, updateFacility } = useFacilitiesAndReservations();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: popupData
      ? {
          ...popupData,
          horarioInicio: popupData.horario?.horarioInicio 
            ? new Date(popupData.horario.horarioInicio).toISOString().slice(0, 16) 
            : "",
          horarioFin: popupData.horario?.horarioFin 
            ? new Date(popupData.horario.horarioFin).toISOString().slice(0, 16) 
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
    console.log('---popupData---', popupData);
  }, []);

  const onSubmit = async (data) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const facilityData = {
        ...data,
        isInternSport: data.isInternSport === "true", // Convertir a booleano
        horario: {
          horarioInicio: new Date(data.horarioInicio), // Convertir a Date
          horarioFin: new Date(data.horarioFin),
        },
      };

      if (popupData?._id) {
        await updateFacility(popupData._id, facilityData);
      } else {
        await addFacility(facilityData);
      }

      setSuccessMessage("Instalación guardada correctamente");
      closeModal();
    } catch (error) {
      setErrorMessage("Error al guardar la instalación.");
      console.error("Error en el formulario de instalaciones:", error);
    }
  };

  return (
    <div id="admin-modal">
      <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
      <h2>{popupData ? "Editar instalación" : "Nueva instalación"}</h2>
      {!successMessage && (
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
                  <option value="true">Sí</option>
                  <option value="false">No</option>
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
      )}

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default AdminModalFacilities;
