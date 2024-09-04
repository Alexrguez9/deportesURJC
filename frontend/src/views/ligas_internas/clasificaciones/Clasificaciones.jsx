import React, { useState, useEffect } from "react";
import './Clasificaciones.css';

const Clasificaciones = () => {
    const [equipos, setEquipos] = useState([]);
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await fetch('http://localhost:4000/equipos');
                if (!response.ok) {
                    throw new Error('Error en el fetch de equipos');
                }
                const data = await response.json();
                setEquipos(data);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        fetchEquipos();
   }, []);
   console.log(equipos);

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const equiposFiltrados = equipos.filter((equipo) => {
        return filtroDeporte === 'Todos' || equipo.sport === filtroDeporte;
    });

    return (
        <div id="clasificaciones-content">
            <h1>Clasificaciones Ligas Internas</h1>
            <p>Consulta las clasificaciones de las ligas internas de la URJC</p>

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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Clasificaciones;
