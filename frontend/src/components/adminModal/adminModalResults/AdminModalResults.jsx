import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { getDateWithoutTime } from "../../../utils/dates.js";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import "./AdminModalResults.css";
import { useForm } from "react-hook-form";

const AdminModalResults = ({ closeModal, popupData, isNewResult }) => {
    const { teams, addResult, updateResult } = useTeamsAndResults();
    const [selectedSport, setSelectedSport] = useState(popupData?.sport || "");
    const [filteredTeams, setFilteredTeams] = useState([]);
    const initialValues = {
        sport: popupData?.sport || "",
        round: popupData?.round || 1,
        localTeam: popupData?.localTeam || "",
        localGoals: popupData?.localGoals || 0,
        visitorTeam: popupData?.visitorTeam || "",
        visitorGoals: popupData?.visitorGoals || 0,
        date: popupData?.date ? getDateWithoutTime(popupData.date) : "",
        hour: popupData?.hour || "",
        place: popupData?.place || "",
    };
    const [equipoLocal, setEquipoLocal] = useState(initialValues.localTeam);
    const [equipoVisitante, setEquipoVisitante] = useState(initialValues.visitorTeam);
    const {
        register,
        handleSubmit: handleSubmitEncuentros,
        formState: { errors: errorResults },
    } = useForm({
        defaultValues: {
            sport: popupData?.sport || "",
            round: popupData?.round || 1,
            localTeam: popupData?.localTeam || "",
            localGoals: popupData?.localGoals || 0,
            visitorTeam: popupData?.visitorTeam || "",
            visitorGoals: popupData?.visitorGoals || 0,
            date: popupData?.date ? getDateWithoutTime(popupData.date) : "",
            hour: popupData?.hour || "",
            place: popupData?.place || "",
        },
    });

    useEffect(() => {
        async function fetchTeams() {
            if (popupData?.localTeam) {
                setEquipoLocal(popupData.localTeam);
            } else if (popupData?.visitorTeam) {
                setEquipoVisitante(popupData.visitorTeam);
            } else {
                setEquipoLocal("");
                setEquipoVisitante("");
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
        const equipoLocal = filteredTeams.find(team => team.name === data.localTeam);
        const equipoVisitante = filteredTeams.find(team => team.name === data.visitorTeam);
        const fullDate = combineDateAndTime(data.date, data.hour);
        data = {
            ...data,
            localTeamId: equipoLocal?._id,
            visitorTeamId: equipoVisitante?._id,
            result: data.localGoals > data.visitorGoals ? "local" : data.localGoals < data.visitorGoals ? "visitante" : "Empate",
            date: fullDate.toISOString(),
        };

        try {
            if (isNewResult) {
                const addResultResponse = await addResult(data);
                if (!addResultResponse.ok) {
                    toast.error("Error añadiendo el resultado");
                    return;
                }
                toast.success("Resultado añadido correctamente");
                closeModal();
            } else {
                const updateResultResponse = await updateResult(popupData._id, data);
                if (!updateResultResponse.ok) {
                    toast.error("Error actualizando el resultado");
                    return;
                }
                toast.success("Resultado actualizado correctamente");
                closeModal();
            }
        } catch (error) {
            toast.error("Ocurrió un error al procesar la solicitud.");
            console.error('Error en onSubmit:', error);
        }
    });

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: 'black' }} />
            {isNewResult ? <h2>Añadir resultado</h2> : <h2>Editar resultado</h2>}
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
                                {...register("round", { required: "Por favor, introduce el número de la round" })}
                                defaultValue={initialValues.round}
                            />
                            {errorResults.round && <span className="error-message">{errorResults.round.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Equipo local:&nbsp;
                            <select
                                {...register("localTeam", { required: "Por favor, selecciona un equipo local" })}
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
                            {errorResults.localTeam && <span className="error-message">{errorResults.localTeam.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Goles del equipo local:
                            <input
                                type="number"
                                {...register("localGoals", { 
                                    required: "Por favor, introduce los goles del equipo local",
                                    validate: (value) => parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos",
                                })}
                                defaultValue={initialValues.localGoals}
                            />
                            {errorResults.localGoals && <span className="error-message">{errorResults.localGoals.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Equipo visitante:&nbsp;
                            <select
                                {...register("visitorTeam", { required: "Por favor, selecciona un equipo visitante" })}
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
                            {errorResults.visitorTeam && <span className="error-message">{errorResults.visitorTeam.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Goles del equipo visitante:
                            <input
                                type="number"
                                {...register("visitorGoals", {
                                    required: "Por favor, introduce los goles del equipo visitante",
                                    validate: (value) => parseInt(value, 10) >= 0 || "Los goles no pueden ser negativos",
                                })}
                                defaultValue={initialValues.visitorGoals}
                            />
                            {errorResults.visitorGoals && <span className="error-message">{errorResults.visitorGoals.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Fecha:
                            <input
                                type="date"
                                {...register("date", { required: "Por favor, introduce la fecha" })}
                                defaultValue={initialValues.date}
                            />
                            {errorResults.date && <span className="error-message">{errorResults.date.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Hora:
                            <input
                                type="time"
                                {...register("hour", { required: "Por favor, introduce la hora" })}
                                defaultValue={initialValues.hour}
                            />
                            {errorResults.hour && <span className="error-message">{errorResults.hour.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Lugar:
                            <input
                                type="text"
                                {...register("place", { required: "Por favor, introduce el place" })}
                                defaultValue={initialValues.place}
                            />
                            {errorResults.place && <span className="error-message">{errorResults.place.message}</span>}
                        </label>
                    </div>
                </div>
                <div><button type="submit" className="button-light">Guardar cambios</button></div>
                {errorResults.login && <span className="error-message">{errorResults.login.message}</span>}
            </form>
        </div>
    );
};

AdminModalResults.propTypes = {
    closeModal: PropTypes.func.isRequired,
    popupData: PropTypes.shape({
        sport: PropTypes.string,
        round: PropTypes.number,
        localTeam: PropTypes.string,
        localGoals: PropTypes.number,
        visitorTeam: PropTypes.string,
        visitorGoals: PropTypes.number,
        date: PropTypes.string,
        hour: PropTypes.string,
        place: PropTypes.string,
        _id: PropTypes.string,
    }),
    isNewResult: PropTypes.bool.isRequired,
};

export default AdminModalResults;
