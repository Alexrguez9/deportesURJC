import { useState, useEffect } from "react";
import './Clasificaciones.css';
import BackButton from '../../../components/backButton/BackButton';
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";

const Clasificaciones = () => {
    const { teams, fetchTeams } = useTeamsAndResults();
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const equiposFiltrados = teams
        .filter((equipo) => filtroDeporte === 'Todos' || equipo.sport === filtroDeporte)
        .sort((a, b) => b.points - a.points); // Sort by points in descending order

    return (
        <div id="component-content">
            <div className="back-button-div">
                <BackButton />
            </div>
            
            <div className="view-header">
                <h1>Clasificaciones Ligas Internas</h1>
                <p>Consulta las clasificaciones de las ligas internas de la URJC</p>
            </div>

            <select value={filtroDeporte} onChange={handleDeporteChange}>
                <option value="Todos">Todos</option>
                <option value="Fútbol-7">Fútbol-7</option>
                <option value="Fútbol-sala">Fútbol-sala</option>
                <option value="Baloncesto">Baloncesto</option>
                <option value="Voleibol">Voleibol</option>
            </select>

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
                    {equiposFiltrados.map((equipo) => (
                        <tr key={equipo._id}>
                            <td>{equipo.name}</td>
                            <td>{equipo.sport}</td>
                            <td>{equipo.results.partidos_ganados}</td>
                            <td>{equipo.results.partidos_empatados}</td>
                            <td>{equipo.results.partidos_perdidos}</td>
                            <td>{equipo.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Clasificaciones;
