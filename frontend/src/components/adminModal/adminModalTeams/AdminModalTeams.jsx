import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import "./AdminModalTeams.css";
import { useForm } from "react-hook-form";

const AdminModalTeams = ({ closeModal, popupData, isNewTeam }) => {
    const { addTeam, updateTeam, updateResultsWithNewTeamName  } = useTeamsAndResults();

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
        points: popupData?.points || 0,
    };

    const onSubmit = handleSubmitResults(async (data) => {
        const formattedData = {
            ...data,
            results: {
                partidos_ganados: data.partidos_ganados,
                partidos_perdidos: data.partidos_perdidos,
                partidos_empatados: data.partidos_empatados,
            },
        };

        try {
            if (isNewTeam) {
                const addRes = await addTeam(formattedData);
                if (!addRes.ok) {
                    toast.error('Error añadiendo el equipo');
                }
                toast.success('Equipo añadido correctamente');
                closeModal();
            } else {
                const oldTeamName = popupData.name;
                const newTeamName = data.name;

                const updateRes = await updateTeam(popupData._id, formattedData);
                if (!updateRes?.ok) {
                    toast.error('Error actualizando el equipo');
                    return;
                }

                if (oldTeamName !== newTeamName) {
                    await updateResultsWithNewTeamName(popupData._id, newTeamName);
                }

                toast.success('Equipo actualizado correctamente');
                closeModal();
            }
        } catch (error) {
            toast.error('Ocurrió un error al procesar la solicitud.');
            console.error("Error en onSubmit:", error);
        }
    });

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: 'black' }} />
            {isNewTeam ? <h2>Añadir equipo</h2> : <h2>Editar equipo</h2>}
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
                                {...register("partidos_ganados", {
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
                                {...register("partidos_perdidos", {
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
                                {...register("partidos_empatados", {
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
                    <div className="input-container">
                        <label>
                            Puntos:
                            <input
                                type="number"
                                {...register("points", {
                                    required: "Por favor, introduce los puntos",
                                    min: { value: 0, message: "El valor no puede ser negativo" },
                                })}
                                defaultValue={initialValues.points}
                            />
                            {errorTeams.points && (
                                <span className="error-message">{errorTeams.points.message}</span>
                            )}
                        </label>
                    </div>
                </div>
                <div>
                    <button type="submit" className="button-light">Guardar cambios</button>
                </div>
            </form>
        </div>
    );
};

AdminModalTeams.propTypes = {
    closeModal: PropTypes.func.isRequired,
    popupData: PropTypes.shape({
        sport: PropTypes.string,
        name: PropTypes.string,
        results: PropTypes.shape({
            partidos_ganados: PropTypes.number,
            partidos_perdidos: PropTypes.number,
            partidos_empatados: PropTypes.number,
        }),
        points: PropTypes.number,
        _id: PropTypes.string,
    }),
    isNewTeam: PropTypes.bool.isRequired,
};

export default AdminModalTeams;
