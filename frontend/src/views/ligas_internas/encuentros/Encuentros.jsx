import React, { useState, useEffect, Fragment } from "react";
import "./Encuentros.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import BackButton from "../../../components/backButton/BackButton";
import ResultsAdminModal from "../../../components/adminModal/adminModalResults/AdminModalResults";

const Encuentros = () => {
    const { user, isAdmin } = useAuth();
    const [resultados, setResultados] = useState([]);
    const [filtroDeporte, setFiltroDeporte] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isNewResult, setIsNewResult] = useState(false);
    
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
        console.log('---resultados: ', resultados);
   }, []);
   
    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const resultadosFiltrados = resultados.filter((resultados) => {
        return filtroDeporte === 'Todos' || resultados.sport === filtroDeporte;
    });

    const openModal = async (resultado) => {
        if (!resultado) {
            setPopupData({
                sport: '',
                jornada: '',
                equipo_local_id: '',
                goles_local: '',
                equipo_visitante: 0,
                equipo_visitante_id: 0,
                goles_visitante: '',
                fecha: '',
                hora: '',
                lugar: ''
            });
            const newResult = true; // Variable temporal
            setIsNewResult(newResult);
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
        fetchResultados();
    }

    const deleteResult = async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/resultados/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Error al borrar el resultado');
            }
            fetchResultados();
        }
        catch (error) {
            console.error('Error al borrar el resultado:', error);
        }
    }

    return (
        <div id="component-content">
            {isModalOpen &&(
                <ResultsAdminModal closeModal={closeModal} isOpen={isModalOpen} popupData={popupData} isNewResult={isNewResult}  />
            )}
            <div className="top-buttons-content">
                <BackButton />
                {user && isAdmin() && <GoPlus onClick={() => openModal()} className="iconPlus" size='1.5em'/>}
            </div>
            <h1>Encuentros</h1>
            {!isAdmin() ? (
                <p>Bienvenido a la página de Encuentros de la Liga Interna de URJC Deportes.</p>
            ) : (
                <Fragment>
                    <p>Aquí puedes administrar los Encuentros de la Liga Interna de URJC Deportes.</p>
                    <p>Si quieres añadir un encuentro, la idea es escoger de los equipos que hay actualmente.
                    <br/>Si necesitas crear un nuevo equipo lo puedes hacer desde el adminPanel.</p>
                </Fragment>
            )}
            <section>
                <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="Todos">Todos</option>
                    <option value="Fútbol-7">Fútbol-7</option>
                    <option value="Fútbol-sala">Fútbol-sala</option>
                    <option value="Básket 3x3">Básket 3x3</option>
                    <option value="Voleibol">Voleibol</option>
                </select>
                { resultadosFiltrados.length === 0 ? 
                    <p>No hay resultados de {filtroDeporte} para mostrar</p> :
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
                                    <td>{resultados.sport}</td>
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
                                        {isAdmin() && <MdOutlineDelete onClick={() => deleteResult(resultados._id)} className="deleteTrash" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </section>
        </div>
    );
}

export default Encuentros;