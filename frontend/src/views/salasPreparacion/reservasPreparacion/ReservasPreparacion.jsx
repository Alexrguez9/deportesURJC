import React, { useState, useEffect } from "react";


const ReservasPreparacion = () => {

    const [reservas, setReservas] = useState([]);
    const [filtroDeporte, setFiltroDeporte] = useState('Gimnasio');

    useEffect(() => {
        const fetchreservas = async () => {
            try {
                const response = await fetch('http://localhost:3000/reservas');
                if (!response.ok) {
                    throw new Error('Error en el fetch de reservas');
                }
                const data = await response.json();
                setReservas(data);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        fetchreservas();
   }, []);
   
    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    // TODO: las reservas filtradas deben filtrarse por instalacion (solo tenemos el id de instalaciones)
    // TODO 2: para ello, hace falta importar todas las instalaciones como estado global. 
    // (también nos sirve para la view de reservas de instalaciones deportivas)
    const reservasFiltradas = reservas.filter((reservas) => {
        return filtroDeporte === 'Todos' || reservas.deporte === filtroDeporte;
    });

    return (
        <div id="reservas-preparacion-content">
            <h1>Reservas de sala de preparación física</h1>
            <p>Bienvenido a la página de Reservas de salas de preparación física URJC Deportes.</p>
            <section>
                <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="Todos">Todos</option>
                    <option value="Fútbol-7">Fútbol-7</option>
                </select>
                <table>
                    <thead>
                        <tr>
                            <th>Deporte</th>
                            <th>Jornada</th>
                            <th>Equipo local</th>
                            <th>Goles local</th>
                            <th></th>
                            <th>Goles visitante</th>
                            <th>Equipo visitante</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Lugar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservasFiltradas.map((reservas) => (
                            <tr key={reservas._id}>
                                <td>{reservas.instalacionId}</td>
                                <td>{reservas.fecha_inicio}</td>
                                <td>{reservas.fecha_fin}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
export default ReservasPreparacion;