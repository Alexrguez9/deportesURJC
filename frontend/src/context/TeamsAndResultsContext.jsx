import {
    createContext,
    useContext, 
    useState,
    useEffect
} from 'react';

const TeamsAndResultsContext = createContext();

export const TeamsAndResultsProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        fetchTeams();
        fetchResults();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch('http://localhost:4000/equipos');
            if (!response?.ok) {
                throw new Error('Error al cargar los equipos');
            }
            const data = await response.json();
            setTeams(data);
            return data;
        } catch (error) {
            console.error("Error al cargar equipos:", error);
        }
    };

    const fetchResults = async () => {
        try {
            const response = await fetch('http://localhost:4000/resultados');
            if (!response?.ok) {
                throw new Error('Error al cargar los resultados');
            }
            const data = await response.json();
            setResults(data);
            return data;
        } catch (error) {
            console.error("Error al cargar resultados:", error);
        }
    };

    const addTeam = async (newTeam) => {
        try {
            const response = await fetch('http://localhost:4000/equipos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTeam),
            });
            if (!response?.ok) {
                throw new Error('Error en el fetch del equipo');
            }
            const data = await response.json();
            setTeams([...teams, data]);
            return response;
        } catch (error) {
            console.error("Error al añadir nuevo equipo:", error);
            return error;
        }
    };
    
    const addResult = async (newData) => {
        try {
            const formattedData = {
                ...newData,
                jornada: Number(newData.jornada),
                goles_local: Number(newData.goles_local),
                goles_visitante: Number(newData.goles_visitante),
                fecha: new Date(newData.fecha).toISOString(), // Asegura que sea formato ISO
            };

            const response = await fetch('http://localhost:4000/resultados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (response?.ok) {
                await response.json();
                return response;
            } else {
                throw new Error(`Error adding result: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding result:', error);
            throw error;
        }
    };

    const updateTeam = async (equipoId, updateData) => {
        try {
            const response = await fetch(`http://localhost:4000/equipos/${equipoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response?.ok) {
                throw new Error('Error al actualizar el equipo');
            }

            const updatedEquipo = await response.json();
            setTeams((prev) => prev.map((e) => (e._id === equipoId ? updatedEquipo : e)));
            return response;
        } catch (error) {
            console.error("Error al actualizar equipo:", error);
            throw error;
        }
    };

    const updateResult = async (resultId, updateData) => {
        try {
            const formattedData = {
                ...updateData,
                jornada: Number(updateData.jornada),
                goles_local: Number(updateData.goles_local),
                goles_visitante: Number(updateData.goles_visitante),
                fecha: new Date(updateData.fecha)?.toISOString(), // Asegura que sea formato ISO
            };

            const response = await fetch(`http://localhost:4000/resultados/${resultId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });
            if (!response?.ok) {
                throw new Error('Error al actualizar el resultado');
            }

            const updatedResult = await response.json();
            await setResults((prev) => prev.map((e) => (e._id === resultId ? updatedResult : e)));
            return response;
        } catch (error) {
            console.error("Error al actualizar resultado:", error);
            throw error;
        }
    };

    const deleteTeam = async (teamId) => {
        try {
            const response = await fetch(`http://localhost:4000/equipos/${teamId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response?.ok) {
                throw new Error(`Error al borrar el equipo: ${response.statusText}`);
            }

            setTeams((prev) => prev.filter((e) => e._id !== teamId));
        } catch (error) {
            console.error("Error al borrar equipo:", error);
            throw error;
        }
    };

    const deleteResult = async (resultId) => {
        try {
            const response = await fetch(`http://localhost:4000/resultados/${resultId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response?.ok) {
                throw new Error(`Error al borrar el resultado: ${response.statusText}`);
            }

            setResults((prev) => prev.filter((e) => e._id !== resultId));
        } catch (error) {
            console.error("Error al borrar resultado:", error);
            throw error;
        }
    };

    return (
        <TeamsAndResultsContext.Provider value={{ 
            teams, 
            results, 
            fetchTeams, 
            fetchResults,
            addTeam,
            addResult,
            updateTeam, 
            updateResult,
            deleteTeam,
            deleteResult,
        }}>
            {children}
        </TeamsAndResultsContext.Provider>
    );
};

// Custom hook para usar el contexto
export const useTeamsAndResults = () => useContext(TeamsAndResultsContext);
