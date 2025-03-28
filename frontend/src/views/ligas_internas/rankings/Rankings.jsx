import { useState, useEffect } from "react";
import './Rankings.css';
import BackButton from '../../../components/backButton/BackButton';
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";

const Rankings = () => {
    const { teams, fetchTeams } = useTeamsAndResults();
    const [selectedSport, setSelectedSport] = useState('Todos');

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDeporteChange = (event) => {
        setSelectedSport(event.target.value);
    };

    const filteredTeams = teams
        .filter((team) => selectedSport === 'Todos' || team.sport === selectedSport)
        .sort((a, b) => b.points - a.points); // Sort by points in descending order

    return (
        <div id="component-content" className="content">
            <div className="back-button-div">
                <BackButton />
            </div>
            
            <div className="view-header">
                <h1>Clasificaciones Ligas Internas</h1>
                <p>Consulta las clasificaciones de las ligas internas de la URJC</p>
            </div>

            <select value={selectedSport} onChange={handleDeporteChange}>
                <option value="Todos">Todos</option>
                <option value="Fútbol-7">Fútbol-7</option>
                <option value="Fútbol-sala">Fútbol-sala</option>
                <option value="Baloncesto">Baloncesto</option>
                <option value="Voleibol">Voleibol</option>
            </select>

            {filteredTeams?.length === 0 ?
                    <p>No hay encuentros de {selectedSport} para mostrar</p> :
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
            }
        </div>
    );
};

export default Rankings;
