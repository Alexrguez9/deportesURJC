import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { ObjectId } from "bson";
import { useAuth } from "../../context/AuthContext";
import "./AdminModal.css";
import { set, useForm } from "react-hook-form";

const AdminModal = ({ closeModal, popupData, isNewResult }) => {
    const { user } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const {
        register,
        handleSubmit: handleSubmitEncuentros,
        setError: setErrorEncuentros,
        formState: { errors: errorsEncuentros },
    } = useForm();

     // Set initial values for form fields based on popupData
     const initialValues = {
        sport: popupData?.sport || "",
        equipo_local: popupData?.equipo_local || "",
        goles_local: popupData?.goles_local || "",
        equipo_visitante: popupData?.equipo_visitante || "",
        goles_visitante: popupData?.goles_visitante || "",
        fecha: popupData?.fecha || "",
        hora: popupData?.hora || "",
        lugar: popupData?.lugar || "",
    };

    const onSubmit = handleSubmitEncuentros(async (data) => {
        console.log('---onSubmit data:', data);

        if (data.goles_local === data.goles_visitante) {
            data.resultado = 'Empate';
        } else if (data.goles_local > data.goles_visitante) {
            data.resultado = 'local';
        } else {
            data.resultado = 'visitante';
        }

        data = {
            ...data,
            equipo_local: data.equipo_local,
            goles_local: data.goles_local,
            equipo_visitante: data.equipo_visitante,
            goles_visitante: data.goles_visitante,
            resultado: data.resultado,
        };

        setSuccessMessage('');
        setErrorMessage('');
        if (isNewResult) {
            data = {
                ...data,
                equipo_visitante_id: new ObjectId().toHexString(),
                equipo_local_id: new ObjectId().toHexString(),
            };
            await addResult(data);
        } else {
            await updateResult(popupData._id, data);
            closeModal();
        }
    });

    const addResult = async (newData) => {
        console.log('---newData:', newData);
        try {
            const response = await fetch('http://localhost:4000/resultados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });
            console.log('---response:', response);
            if (response.ok) {
                await response.json();
                setSuccessMessage('Resultado añadido correctamente');
                return response;
            } else {
                console.log('Error añadiendo el resultado:', response);
                setErrorMessage('Error añadiendo el resultado');
                throw new Error(`Error adding result: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding result:', error);
            throw error;
        }
    };

    const updateResult = async (resultId, updateData) => {
        console.log('---updateData:', updateData);
        try {
            const response = await fetch(`http://localhost:4000/resultados/${resultId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            });
      
            if (response.ok) {
                await response.json();
                return response;
            } else {
                setErrorMessage('Error actualizando el usuario');
                throw new Error(`Error updating user: ${response.statusText}`);
            }
          } catch (error) {
            console.error('Error updating result:', error);
            throw error;
          }
    }

    return (
        <div id="admin-modal">
        <IoMdClose id="close-menu" onClick={closeModal} style={{ color: 'black' }} />
        <h2>Administrar resultados</h2>
        { !successMessage &&
            <form onSubmit={onSubmit}>
                <div className="inputs">
                    <div className="input-container">
                        <label>
                        Deporte:
                        <input
                            type="text"
                            {...register("sport", { required: "Por favor, introduce el deporte" })}
                            defaultValue={initialValues.sport}
                        />
                        {errorsEncuentros.sport && <span className="error-message">{errorsEncuentros.sport.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Jornada:
                        <input
                            type="Int32"
                            {...register("jornada", { required: "Por favor, introduce el número de la jornada" })}
                            defaultValue={initialValues.jornada}
                        />
                        {errorsEncuentros.jornada && <span className="error-message">{errorsEncuentros.jornada.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Nombre del equipo local:
                        <input
                            type="text"
                            {...register("equipo_local", { required: "Por favor, introduce el nombre del equipo local" })}
                            defaultValue={initialValues.equipo_local}
                        />
                        {errorsEncuentros.equipo_local && <span className="error-message">{errorsEncuentros.equipo_local.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Goles del equipo local:
                        <input
                            type="Int32"
                            {...register("goles_local", { 
                                required: "Por favor, introduce los goles del equipo local",
                                validate: (value) => {
                                    return parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos";
                                },
                            })}
                            defaultValue={initialValues.goles_local}
                        />
                        {errorsEncuentros.goles_local && <span className="error-message">{errorsEncuentros.goles_local.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Nombre del equipo visitante:
                        <input
                            type="text"
                            {...register("equipo_visitante", { required: "Por favor, introduce el nombre del equipo visitante" })}
                            defaultValue={initialValues.equipo_visitante}
                        />
                        {errorsEncuentros.equipo_visitante && <span className="error-message">{errorsEncuentros.equipo_visitante.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Goles del equipo visitante:
                        <input
                            type="number"
                            {...register("goles_visitante", {
                                required: "Por favor, introduce los goles del equipo visitante",
                                validate: (value) => {
                                    return parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos";
                                },
                            })}
                            defaultValue={initialValues.goles_visitante}

                        />
                        {errorsEncuentros.goles_visitante && <span className="error-message">{errorsEncuentros.goles_visitante.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Fecha:
                            <input
                            type="date"
                            {...register("fecha", { required: "Por favor, introduce la fecha" })}
                            defaultValue={initialValues.fecha}

                            />
                            {errorsEncuentros.fecha && <span className="error-message">{errorsEncuentros.fecha.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Hora:
                        <input
                            type="time"
                            {...register("hora", { required: "Por favor, introduce la hora" })}
                            defaultValue={initialValues.hora}
                        />
                        {errorsEncuentros.hora && <span className="error-message">{errorsEncuentros.hora.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                        Lugar:
                        <input
                            type="text"
                            {...register("lugar", { required: "Por favor, introduce el lugar" })}
                            defaultValue={initialValues.lugar}
                        />
                        {errorsEncuentros.lugar && <span className="error-message">{errorsEncuentros.lugar.message}</span>}
                        </label>
                    </div>
                </div>
                <div className="login-button"><button type="submit">Guardar cambios</button></div>
                {errorsEncuentros.login && <span className="error-message">{errorsEncuentros.login.message}</span>}
            </form>
        }
        {user && successMessage && <p className="success-message">{successMessage}</p>}
        {user && errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    );
};
export default AdminModal;