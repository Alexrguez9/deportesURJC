import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { getDateWithoutTime } from "../../../utils/results.js";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import "./AdminModalResults.css";
import { useForm } from "react-hook-form";

const ResultsAdminModal = ({ closeModal, popupData, isNewResult }) => {
    const { user } = useAuth();
    const { teams, addResult, updateResult } = useTeamsAndResults();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedSport, setSelectedSport] = useState(popupData?.sport || "");
    const [filteredTeams, setFilteredTeams] = useState([]);
    const initialValues = {
        sport: popupData?.sport || "",
        jornada: popupData?.jornada || 1,
        equipo_local: popupData?.equipo_local || "",
        goles_local: popupData?.goles_local || 0,
        equipo_visitante: popupData?.equipo_visitante || "",
        goles_visitante: popupData?.goles_visitante || 0,
        fecha: popupData?.fecha ? getDateWithoutTime(popupData.fecha) : "",
        hora: popupData?.hora || "",
        lugar: popupData?.lugar || "",
    };
    const [equipoLocal, setEquipoLocal] = useState(initialValues.equipo_local);
    const [equipoVisitante, setEquipoVisitante] = useState(initialValues.equipo_visitante);
    const {
        register,
        handleSubmit: handleSubmitEncuentros,
        formState: { errors: errorResults },
    } = useForm({
        defaultValues: {
            sport: popupData?.sport || "",
            jornada: popupData?.jornada || 1,
            equipo_local: popupData?.equipo_local || "",
            goles_local: popupData?.goles_local || 0,
            equipo_visitante: popupData?.equipo_visitante || "",
            goles_visitante: popupData?.goles_visitante || 0,
            fecha: popupData?.fecha ? getDateWithoutTime(popupData.fecha) : "",
            hora: popupData?.hora || "",
            lugar: popupData?.lugar || "",
        },
    });

    useEffect(() => {
        async function fetchTeams() {
            if (popupData?.equipo_local) {
                setEquipoLocal(popupData.equipo_local);
            } else if (popupData?.equipo_visitante) {
                setEquipoVisitante(popupData.equipo_visitante);
            }
            // Filtrar equipos basados en el deporte seleccionado
            const newFilteredTeams = teams.filter(team => team.sport === selectedSport);
            await setFilteredTeams(newFilteredTeams);
        }
        fetchTeams();
    }, [selectedSport, teams, popupData]);

    const uniqueSports = ['Fútbol-7', 'Fútbol-sala', 'Básket 3x3', 'Voleibol'];

    const combineDateAndTime = (date, time) => {
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':');
        dateObj.setHours(hours, minutes, 0, 0);
        return dateObj;
    };   


    const onSubmit = handleSubmitEncuentros(async (data) => {
        const equipoLocal = filteredTeams.find(team => team.name === data.equipo_local);
        const equipoVisitante = filteredTeams.find(team => team.name === data.equipo_visitante);
        const fullDate = combineDateAndTime(data.fecha, data.hora);

        data = {
            ...data,
            equipo_local_id: equipoLocal?._id,
            equipo_visitante_id: equipoVisitante?._id,
            resultado: data.goles_local > data.goles_visitante ? "local" : data.goles_local < data.goles_visitante ? "visitante" : "Empate",
            fecha: fullDate.toISOString(),
        };

        if (isNewResult) {
            const addResultResponse = await addResult(data);
            if (addResultResponse.ok) {
                setSuccessMessage("Resultado añadido correctamente");
            } else {
                setErrorMessage("Error añadiendo el resultado");
            }
        } else {
            const updateResultResponse = await updateResult(popupData._id, data);
            if (updateResultResponse.ok) {
                setSuccessMessage("Resultado actualizado correctamente");
            } else {
                setErrorMessage("Error actualizando el resultado");
            }
        }
    });

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: 'black' }} />
            {isNewResult ? <h2>Añadir resultado</h2> : <h2>Editar resultado</h2>}
            {!successMessage && !errorMessage && (
                <form onSubmit={onSubmit}>
                    <div className="inputs">
                        <div className="input-container">
                            <label>
                                Deporte:&nbsp;
                                <select
                                {...register("sport", { required: "Por favor, selecciona un deporte" })}
                                    value={selectedSport}
                                    onChange={(e) => {
                                        setSelectedSport(e.target.value);
                                    }}
                                >
                                    <option value="">Selecciona un deporte</option>
                                    {uniqueSports.map((sport) => (
                                        <option key={sport} value={sport}>
                                            {sport}
                                        </option>
                                    ))}
                                </select>
                                {errorResults.sport && <span className="error-message">{errorResults.sport.message}</span>}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Jornada:
                                <input
                                    type="number"
                                    {...register("jornada", { required: "Por favor, introduce el número de la jornada" })}
                                    defaultValue={initialValues.jornada}
                                />
                                {errorResults.jornada && <span className="error-message">{errorResults.jornada.message}</span>}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Equipo local:&nbsp;
                                <select
                                    {...register("equipo_local", { required: "Por favor, selecciona un equipo local" })}
                                    value={equipoLocal}
                                    onChange={(e) => setEquipoLocal(e.target.value)}
                                >
                                    <option value="">Selecciona un equipo</option>
                                    {filteredTeams.map(team => (
                                        <option key={team._id} value={team.name}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                                {errorResults.equipo_local && <span className="error-message">{errorResults.equipo_local.message}</span>}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Goles del equipo local:
                                <input
                                    type="number"
                                    {...register("goles_local", { 
                                        required: "Por favor, introduce los goles del equipo local",
                                        validate: (value) => parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos",
                                    })}
                                    defaultValue={initialValues.goles_local}
                                />
                                {errorResults.goles_local && <span className="error-message">{errorResults.goles_local.message}</span>}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Equipo visitante:&nbsp;
                                <select
                                    {...register("equipo_visitante", { required: "Por favor, selecciona un equipo visitante" })}
                                    value={equipoVisitante}
                                    onChange={(e) => setEquipoVisitante(e.target.value)}
                                >
                                    <option value="">Selecciona un equipo</option>
                                    {filteredTeams.map(team => (
                                        <option key={team._id} value={team.name}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                                {errorResults.equipo_visitante && <span className="error-message">{errorResults.equipo_visitante.message}</span>}
                            </label>
                        </div>
                        <div className="input-container">
                            <label>
                                Goles del equipo visitante:
                                <input
                                    type="number"
                                    {...register("goles_visitante", {
                                        required: "Por favor, introduce los goles del equipo visitante",
                                        validate: (value) => parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos",
                                    })}
                                    defaultValue={initialValues.goles_visitante}
                                />
                                {errorResults.goles_visitante && <span className="error-message">{errorResults.goles_visitante.message}</span>}
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
                                {errorResults.fecha && <span className="error-message">{errorResults.fecha.message}</span>}
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
                                {errorResults.hora && <span className="error-message">{errorResults.hora.message}</span>}
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
                                {errorResults.lugar && <span className="error-message">{errorResults.lugar.message}</span>}
                            </label>
                        </div>
                    </div>
                    <div><button type="submit" className="button-light">Guardar cambios</button></div>
                    {errorResults.login && <span className="error-message">{errorResults.login.message}</span>}
                </form>
            )}
            {/* {TODO: Añadir mensajes de éxito y error} */}
            {user && successMessage && <p className="success-message">{successMessage}</p>}
            {user && errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default ResultsAdminModal;