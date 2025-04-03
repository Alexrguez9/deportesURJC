import { useState, useEffect } from "react";
import './Rankings.css';
import BackButton from '../../../components/backButton/BackButton';
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";

const Rankings = () => {
    const { teams, fetchTeams } = useTeamsAndResults();
    const [selectedSport, setSelectedSport] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDeporteChange = (event) => {
        setSelectedSport(event.target.value);
    };

    const filteredTeams = selectedSport
        ? teams.filter((team) => team.sport === selectedSport).sort((a, b) => b.points - a.points)
        : []; // Muestra equipos solo si se ha seleccionado un deporte

    return (
        <div id="component-content" className="content">
            <div className="top-buttons-content">
                <BackButton />
            </div>
            <div className="view-header">
                <h1>Clasificaciones Ligas Internas</h1>
                <p>Consulta las clasificaciones de las ligas internas de la URJC</p>
            </div>
            <select value={selectedSport} onChange={handleDeporteChange} className="select-sport">
                <option value="">Elige un deporte</option>
                <option value="Fútbol-7">Fútbol-7</option>
                <option value="Fútbol-sala">Fútbol-sala</option>
                <option value="Baloncesto">Baloncesto</option>
                <option value="Voleibol">Voleibol</option>
            </select>

            {selectedSport && (
                filteredTeams?.length === 0 ? (
                    <p>No hay encuentros de {selectedSport} para mostrar</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Deporte</th>
                                <th>Ganados</th>
                                <th>Empatados</th>
                                <th>Perdidos</th>
                                <th>Puntos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeams.map((team) => (
                                <tr key={team._id}>
                                    <td>{team.name}</td>
                                    <td>{team.sport}</td>
                                    <td>{team.results.wins}</td>
                                    <td>{team.results.draws}</td>
                                    <td>{team.results.losses}</td>
                                    <td>{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </div>
    );
};

export default Rankings;
