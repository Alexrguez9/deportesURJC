import React, { useState, useEffect } from "react";
import "./AdminTeams.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../../context/AuthContext";
import BackButton from "../../../../components/backButton/BackButton";
import AdminModalTeams from "../../../../components/adminModal/adminModalTeams/AdminModalTeams";
import { useTeamsAndResults } from "../../../../context/TeamsAndResultsContext";

const AdminTeams = () => {
    console.log('---AdminTeams---');
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

    const openModal = async (resultado) => {
        console.log('---openModal resultado:', resultado);
        if (!resultado) {
            setPopupData({
                sport: '',
                name: '',
                results: {
                    partidos_ganados: '',
                    partidos_perdidos: '',
                    partidos_empatados: ''
                },
            });
            console.log('---openModal popupData:', popupData);
            const newResult = true; // Variable temporal
            setIsNewResult(newResult);
            console.log('---openModal isNewTeam:', newResult);
            setIsModalOpen(true);
            return;
        }
        const newPopupData = await { ...resultado };
        setPopupData(newPopupData);
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        setIsNewResult(false);
        fetchTeams();
    }

    return (
        <div id="component-content">
            {isAdmin() && (
                <React.Fragment>
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
                    <br/>De esta manera, después podrás añadir los resultados de los partidos jugados.
                    </p>
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
                                    <th>Partidos ganados</th>
                                    <th>Partidos perdidos</th>
                                    <th>Partidos empatados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileteredTeams.map((teams) => (
                                    <tr key={teams._id}>
                                        <td>{teams.sport}</td>
                                        <td>{teams.name}</td>
                                        <td>{teams.results.partidos_ganados}</td>
                                        <td>{teams.results.partidos_perdidos}</td>
                                        <td>{teams.results.partidos_empatados}</td>
                                        <td>
                                            <GoPencil onClick={() => openModal(teams)} className="editPencil" />
                                            <MdOutlineDelete onClick={() => deleteTeam(teams._id)} className="deleteTrash" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </React.Fragment>
            )}
        </div>
    );
}

export default AdminTeams;