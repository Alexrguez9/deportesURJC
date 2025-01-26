import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import "./AdminModalTeams.css";
import { useForm } from "react-hook-form";

const AdminModalTeams = ({ closeModal, popupData, isNewTeam }) => {
    const { user } = useAuth();
    const { teams, addTeam, updateTeam } = useTeamsAndResults();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit: handleSubmitResults,
        formState: { errors: errorTeams },
    } = useForm();

    // Obtener lista de deportes únicos
    const uniqueSports = ['Fútbol-7', 'Fútbol-sala', 'Básket 3x3', 'Voleibol'];

    // Valores iniciales del formulario
    const initialValues = {
        sport: popupData?.sport || "",
        name: popupData?.name || "",
        partidos_ganados: popupData?.results?.partidos_ganados || 0,
        partidos_perdidos: popupData?.results?.partidos_perdidos || 0,
        partidos_empatados: popupData?.results?.partidos_empatados || 0,
    };

    const onSubmit = handleSubmitResults(async (data) => {
        setSuccessMessage('');
        setErrorMessage('');

        try {
            if (isNewTeam) {
                const addTeamResponse = await addTeam(data);
                if (addTeamResponse.ok) {
                    setSuccessMessage('Equipo añadido correctamente');
                } else {
                    setErrorMessage('Error añadiendo el equipo');
                }
            } else {
                await updateTeam(popupData._id, data);
                closeModal();
            }
        } catch (error) {
            setErrorMessage('Ocurrió un error al procesar la solicitud.');
            console.error("Error en onSubmit:", error);
        }
    });

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: 'black' }} />
            {isNewTeam ? <h2>Añadir equipo</h2> : <h2>Editar equipo</h2>}
            {!successMessage && (
                <form onSubmit={onSubmit}>
                    <div className="inputs">
                        <div className="input-container">
                            <label>
                                Deporte:&nbsp;
                                <select
                                    {...register("sport", { required: "Por favor, selecciona un deporte" })}
                                    defaultValue={initialValues.sport}
                                >
                                    <option value="">Selecciona un deporte</option>
                                    {uniqueSports.map((sport) => (
                                        <option key={sport} value={sport}>
                                            {sport}
                                        </option>
                                    ))}
                                </select>
                                {errorTeams.sport && (
                                    <span className="error-message">{errorTeams.sport.message}</span>
                                )}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Nombre del equipo:
                                <input
                                    type="text"
                                    {...register("name", { required: "Por favor, introduce el nombre del equipo" })}
                                    defaultValue={initialValues.name}
                                />
                                {errorTeams.name && (
                                    <span className="error-message">{errorTeams.name.message}</span>
                                )}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Partidos ganados:
                                <input
                                    type="number"
                                    {...register("results.partidos_ganados", {
                                        required: "Por favor, introduce los partidos ganados",
                                        min: { value: 0, message: "El valor no puede ser negativo" },
                                    })}
                                    defaultValue={initialValues.partidos_ganados}
                                />
                                {errorTeams.partidos_ganados && (
                                    <span className="error-message">{errorTeams.partidos_ganados.message}</span>
                                )}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Partidos perdidos:
                                <input
                                    type="number"
                                    {...register("results.partidos_perdidos", {
                                        required: "Por favor, introduce los partidos perdidos",
                                        min: { value: 0, message: "El valor no puede ser negativo" },
                                    })}
                                    defaultValue={initialValues.partidos_perdidos}
                                />
                                {errorTeams.partidos_perdidos && (
                                    <span className="error-message">{errorTeams.partidos_perdidos.message}</span>
                                )}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Partidos empatados:
                                <input
                                    type="number"
                                    {...register("results.partidos_empatados", {
                                        required: "Por favor, introduce los partidos empatados",
                                        min: { value: 0, message: "El valor no puede ser negativo" },
                                    })}
                                    defaultValue={initialValues.partidos_empatados}
                                />
                                {errorTeams.partidos_empatados && (
                                    <span className="error-message">{errorTeams.partidos_empatados.message}</span>
                                )}
                            </label>
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="button-light">Guardar cambios</button>
                    </div>
                </form>
            )}
            {user && successMessage && <p className="success-message">{successMessage}</p>}
            {user && errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AdminModalTeams;
