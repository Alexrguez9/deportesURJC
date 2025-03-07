import {
    useState,
    useEffect,
    Fragment 
} from "react";
import "./Encuentros.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import BackButton from "../../../components/backButton/BackButton";
import ResultsAdminModal from "../../../components/adminModal/adminModalResults/AdminModalResults";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";

const Encuentros = () => {
    const { user, isAdmin } = useAuth();
    const { results, fetchResults, deleteResult } = useTeamsAndResults();
    const [filtroDeporte, setFiltroDeporte] = useState('Fútbol-7');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [isNewResult, setIsNewResult] = useState(false);

    useEffect(() => {
        async function fetchData() {
            await fetchResults();
        }
        fetchData();
   }, []);
   
    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const filteredResults = results?.filter((results) => {
        return filtroDeporte === 'Fútbol-7' || results.sport === filtroDeporte;
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
        fetchResults();
    }

    return (
        <div id="component-content">
            {isModalOpen &&(
                <ResultsAdminModal closeModal={closeModal} isOpen={isModalOpen} popupData={popupData} isNewResult={isNewResult}  />
            )}
            <div className="top-buttons-content">
                <BackButton />
                {user && isAdmin() && <GoPlus onClick={() => openModal()} className="iconPlus" size='1.5em' data-testid="add-button"/>}
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
                    <option value="Fútbol-7">Fútbol-7</option>
                    <option value="Fútbol-sala">Fútbol-sala</option>
                    <option value="Básket 3x3">Básket 3x3</option>
                    <option value="Voleibol">Voleibol</option>
                </select>
                { filteredResults?.length === 0 ? 
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
                            {filteredResults?.map((results) => (
                                <tr key={results._id}>
                                    <td>{results.sport}</td>
                                    <td>{results.jornada}</td>
                                    <td>{results.equipo_local}</td>
                                    <td>{results.goles_local}</td>
                                    <td>-</td>
                                    <td>{results.goles_visitante}</td>
                                    <td>{results.equipo_visitante}</td>
                                    <td>{results.fecha}</td>
                                    <td>{results.hora}</td>
                                    <td>{results.lugar}</td>
                                    <td>
                                        {isAdmin() && <GoPencil onClick={() => openModal(results)} className="editPencil" />}
                                        {isAdmin() && <MdOutlineDelete onClick={() => deleteResult(results._id)} className="deleteTrash" />}
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