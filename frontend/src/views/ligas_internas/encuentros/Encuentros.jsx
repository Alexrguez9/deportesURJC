import React, { useState, useEffect } from "react";
import "./Encuentros.css";
import { GoPencil } from "react-icons/go";
import { useAuth } from "../../../context/AuthContext";
import BackButton from "../../../components/backButton/BackButton";
import AdminModal from "../../../components/adminModal/AdminModal";

const Encuentros = () => {
    const { isAdmin } = useAuth();
    const [resultados, setResultados] = useState([]);
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    
    const fetchResultados = async () => {
        try {
            const response = await fetch('http://localhost:4000/resultados');
            if (!response.ok) {
                throw new Error('Error en el fetch de resultados');
            }
            const data = await response.json();
            setResultados(data);
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    };

    useEffect(() => {
        fetchResultados();
   }, []);
   
    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const resultadosFiltrados = resultados.filter((resultados) => {
        return filtroDeporte === 'Todos' || resultados.deporte === filtroDeporte;
    });

    const openModal = async (resultado) => {
        const newPopupData = await { ...resultado };
        setPopupData(newPopupData);
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        fetchResultados();
    }

    return (
        <div id="component-content">
            {isModalOpen &&(
                <AdminModal closeModal={closeModal} isOpen={isModalOpen} popupData={popupData}  />
            )}
            <div className="view-header">
                <BackButton />
                <h1>Encuentros</h1>
                <p>
                    Bienvenido a la página de Encuentros de la Liga Interna de URJC Deportes.
                </p>
            </div>
            
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
                        {resultadosFiltrados.map((resultados) => (
                            <tr key={resultados._id}>
                                <td>{resultados.deporte}</td>
                                <td>{resultados.jornada}</td>
                                <td>{resultados.equipo_local}</td>
                                <td>{resultados.goles_local}</td>
                                <td>-</td>
                                <td>{resultados.goles_visitante}</td>
                                <td>{resultados.equipo_visitante}</td>
                                <td>{resultados.fecha}</td>
                                <td>{resultados.hora}</td>
                                <td>{resultados.lugar}</td>
                                <td>
                                    {isAdmin() && <GoPencil onClick={() => openModal(resultados)} className="editPencil" />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Encuentros;