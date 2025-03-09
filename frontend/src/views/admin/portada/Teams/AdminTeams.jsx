import { useState, useEffect, Fragment } from "react";
import { toast } from "sonner";
import "./AdminTeams.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../../context/AuthContext";
import BackButton from "../../../../components/backButton/BackButton";
import AdminModalTeams from "../../../../components/adminModal/adminModalTeams/AdminModalTeams";
import { useTeamsAndResults } from "../../../../context/TeamsAndResultsContext";
import AccessDenied from "../../../../components/accessDenied/AccessDenied";

const AdminTeams = () => {
    const { user, isAdmin } = useAuth();
    const { teams, fetchTeams, deleteTeam } = useTeamsAndResults();
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isNewTeam, setIsNewResult] = useState(false);

    useEffect(() => {
        fetchTeams();
   }, []);
   
    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const fileteredTeams = teams.filter((teams) => {
        return filtroDeporte === 'Todos' || teams.sport === filtroDeporte;
    });

    const openModal = async (team) => {
        if (!team) {
            setPopupData({
                sport: '',
                name: '',
                results: {
                    partidos_ganados: 0,
                    partidos_perdidos: 0,
                    partidos_empatados: 0,
                },
            });
            const newResult = true; // Variable temporal
            setIsNewResult(newResult);
            setIsModalOpen(true);
            return;
        }
        const newPopupData = await { ...team };
        setPopupData(newPopupData);
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        setIsNewResult(false);
        fetchTeams();
    }

    const handleDeleteTeam = async (teamId) => {
        try {
            const deleteRes = await deleteTeam(teamId);
            if (!deleteRes.ok) {
                toast.error("Error al eliminar el equipo.");
                return;
            }
            toast.success("Equipo eliminado correctamente");
            fetchTeams();
        } catch (error) {
            console.error("Error al eliminar el equipo:", error);
            toast.error("Error al eliminar el equipo.");
        }
    }

    return (
        <div id="component-content">
            {isAdmin() ? (
                <Fragment>
                    {isModalOpen &&(
                        <AdminModalTeams closeModal={closeModal} isOpen={isModalOpen} popupData={popupData} isNewTeam={isNewTeam}  />
                    )}
                    <div className="top-buttons-content">
                        <BackButton />
                        {user && isAdmin() && <GoPlus onClick={() => openModal()} className="iconPlus" size='1.5em'/>}
                    </div>
                    <h1>Equipos</h1>
                    <p>
                        Aquí puedes administrar los Equipos de la Liga Interna de URJC Deportes.
                    </p>
                    <p>Si quieres añadir un equipo, la idea es añadirlo con 0 partidos ganados, 0 partidos perdidos y 0 partidos empatados.
                    <br/>De esta manera, después podrás añadir los resultados de dicho equipo.
                    </p>
                    <p>IMPORTANTE! Si editas los puntos, no se editará ningún resultado. Solo usar esta opciçon en caso urgente.</p>
                    <section>
                        <select value={filtroDeporte} onChange={handleDeporteChange}>
                            <option value="Todos">Todos</option>
                            <option value="Fútbol-7">Fútbol-7</option>
                            <option value="Fútbol-sala">Fútbol-sala</option>
                            <option value="Básket 3x3">Básket 3x3</option>
                            <option value="Voleibol">Voleibol</option>
                        </select>
                        <table>
                            <thead>
                                <tr>
                                    <th>Deporte</th>
                                    <th>Nombre del equipo</th>
                                    <th>Ganados</th>
                                    <th>Perdidos</th>
                                    <th>Empatados</th>
                                    <th>Puntos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileteredTeams.map((teams) => (
                                    <tr key={teams?._id}>
                                        <td>{teams?.sport}</td>
                                        <td>{teams?.name}</td>
                                        <td>{teams?.results?.partidos_ganados}</td>
                                        <td>{teams?.results?.partidos_perdidos}</td>
                                        <td>{teams?.results?.partidos_empatados}</td>
                                        <td>{teams?.points}</td>
                                        <td>
                                            <GoPencil onClick={() => openModal(teams)} className="editPencil" />
                                            <MdOutlineDelete onClick={() => handleDeleteTeam(teams._id)} className="deleteTrash" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </Fragment>
            ): (
                <AccessDenied />
            )}
        </div>
    );
}

export default AdminTeams;