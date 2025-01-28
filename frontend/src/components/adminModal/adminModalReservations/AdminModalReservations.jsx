import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext";
import "./AdminModalReservations.css";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const AdminModalReservations = ({ closeModal, popupData }) => {
  const { addReservation, updateReservation } = useFacilitiesAndReservations();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formatDateForInput = (date) => {
    if (!date) return "";
    const formattedDate = new Date(date).toISOString().slice(0, 16); // Extrae hasta los minutos
    return formattedDate;
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
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (popupData?._id) {
        await updateReservation(popupData._id, data);
      } else {
        await addReservation(data);
      }
      setSuccessMessage("Reserva guardada correctamente");
      closeModal();
    } catch (error) {
      setErrorMessage("Error al guardar la reserva.");
      console.error("Error en el formulario de reservas:", error);
    }
  };

  return (
    <div id="admin-modal">
      <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
      <h2>{popupData ? "Editar reserva" : "Nueva reserva"}</h2>
      {!successMessage && (
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
      )}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default AdminModalReservations;
