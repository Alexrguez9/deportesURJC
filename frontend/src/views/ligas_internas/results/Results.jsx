import {
    useState,
    useEffect,
    Fragment
} from "react";
import { toast } from "sonner";
import "./Results.css";
import { GoPencil, GoPlus } from "react-icons/go";
import { MdOutlineDelete } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import BackButton from "../../../components/backButton/BackButton";
import ResultsAdminModal from "../../../components/adminModal/adminModalResults/AdminModalResults";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { getPrettyDate } from "../../../utils/dates";

const Results = () => {
    const { user, isAdmin } = useAuth();
    const { results, fetchResults, deleteResult } = useTeamsAndResults();
    const [selectedSport, setSelectedSport] = useState('');
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
        setSelectedSport(event.target.value);
    };

    const filteredResults = results?.filter(result => selectedSport && result.sport === selectedSport);
    // Sort the results by round
    const sortedResults = filteredResults?.sort((a, b) => a.round - b.round);

    const openModal = async (result) => {
        if (!result) {
            setPopupData({
                sport: '',
                round: 1,
                localTeam: '',
                localTeamId: '',
                localGoals: 0,
                visitorTeam: '',
                visitorTeamId: '',
                visitorGoals: 0,
                date: '',
                hour: '',
                place: ''
            });
            const newResult = true;
            setIsNewResult(newResult);
            setIsModalOpen(true);
            return;
        }
        const newPopupData = await { ...result };
        setPopupData(newPopupData);
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        setIsNewResult(false);
        fetchResults();
    }

    const handleDeleteResult = async (resultId) => {
        try {
            const deleteRes = await deleteResult(resultId);
            if (!deleteRes.ok) {
                toast.error("Error al eliminar el resultado.");
                return;
            }
            toast.success("Resultado eliminado correctamente");
            fetchResults();
        } catch (error) {
            toast.error("Error al eliminar el resultado.");
            console.error("Error en handleDeleteResult:", error);
        }
    }

    return (
        <div id="component-content">
            {isModalOpen && (
                <ResultsAdminModal closeModal={closeModal} isOpen={isModalOpen} popupData={popupData} isNewResult={isNewResult} />
            )}
            <div className="top-buttons-content">
                <BackButton />
                {user && isAdmin() && <GoPlus onClick={() => openModal()} className="iconPlus" size='1.5em' data-testid="add-button" />}
            </div>
            <h1>Encuentros</h1>
            {!isAdmin() ? (
                <p>Bienvenido a la página de Encuentros de la Liga Interna de URJC Deportes.</p>
            ) : (
                <Fragment>
                    <p>Aquí puedes administrar los Encuentros de la Liga Interna de URJC Deportes.</p>
                    <p>Si quieres añadir un encuentro, la idea es escoger de los equipos que hay actualmente.
                        <br />Si necesitas crear un nuevo equipo lo puedes hacer desde el adminPanel.</p>
                </Fragment>
            )}
            <section className="table-responsive">
                <select value={selectedSport} onChange={handleDeporteChange}>
                    <option value="">Elige un deporte</option>
                    <option value="Fútbol-7">Fútbol-7</option>
                    <option value="Fútbol-sala">Fútbol-sala</option>
                    <option value="Básket 3x3">Básket 3x3</option>
                    <option value="Voleibol">Voleibol</option>
                </select>

                {!selectedSport ? (
                    <p>Selecciona un deporte para ver sus resultados</p>
                ) : sortedResults?.length === 0 ? (
                    <p>No hay resultados de {selectedSport} para mostrar</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Jornada</th>
                                <th>Equipo local</th>
                                <th>Goles local</th>
                                <th>Goles visitante</th>
                                <th>Equipo visitante</th>
                                <th  style={{ minWidth: '170px' }}>Fecha</th>
                                <th>Lugar</th>
                                {isAdmin() && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResults?.map((results) => (
                                <tr key={results._id}>
                                    <td>{results.round}</td>
                                    <td>{results.localTeam}</td>
                                    <td>{results.localGoals}</td>
                                    <td>{results.visitorGoals}</td>
                                    <td>{results.visitorTeam}</td>
                                    <td>{getPrettyDate(results.date)}</td>
                                    <td>{results.place}</td>
                                    {isAdmin() && (
                                        <td>
                                            <>
                                                <GoPencil onClick={() => openModal(results)} className="editPencil" />
                                                <MdOutlineDelete onClick={() => handleDeleteResult(results._id)} className="deleteTrash" />
                                            </>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Results;