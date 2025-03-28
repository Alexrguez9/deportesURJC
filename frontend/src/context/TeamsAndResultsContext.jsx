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
            const response = await fetch('http://localhost:4000/teams');
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
            const response = await fetch('http://localhost:4000/results');
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
            const response = await fetch('http://localhost:4000/teams', {
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
                round: Number(newData.round),
                localGoals: Number(newData.localGoals),
                visitorGoals: Number(newData.visitorGoals),
                date: new Date(newData.date).toISOString(), // Ensure ISO format
            };

            const response = await fetch('http://localhost:4000/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (!response?.ok) {
                throw new Error(`Error adding result: ${response.statusText}`);
            }
            const data = await response.json();
            setResults([...results, data]);
            return response;
        } catch (error) {
            console.error('Error adding result:', error);
            throw error;
        }
    };

    const updateTeam = async (equipoId, updateData) => {
        try {
            const response = await fetch(`http://localhost:4000/teams/${equipoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response?.ok) {
                throw new Error('Error al actualizar el equipo');
            }

            const updatedTeam = await response.json();
            setTeams((prev) => prev.map((e) => (e._id === equipoId ? updatedTeam : e)));
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
                round: Number(updateData.round),
                localGoals: Number(updateData.localGoals),
                visitorGoals: Number(updateData.visitorGoals),
                date: new Date(updateData.date)?.toISOString(), // Asegura que sea formato ISO
            };

            const response = await fetch(`http://localhost:4000/results/${resultId}`, {
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
            const response = await fetch(`http://localhost:4000/teams/${teamId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response?.ok) {
                throw new Error(`Error al borrar el equipo: ${response.statusText}`);
            }

            setTeams((prev) => prev.filter((e) => e._id !== teamId));
            return response;
        } catch (error) {
            console.error("Error al borrar equipo:", error);
            throw error;
        }
    };

    const deleteResult = async (resultId) => {
        try {
            const response = await fetch(`http://localhost:4000/results/${resultId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response?.ok) {
                throw new Error(`Error al borrar el resultado: ${response.statusText}`);
            }

            setResults((prev) => prev.filter((e) => e._id !== resultId));
            return response;
        } catch (error) {
            console.error("Error al borrar resultado:", error);
            throw error;
        }
    };

    const updateResultsWithNewTeamName = async (teamId, newTeamName) => {
        try {
            const response = await fetch(`http://localhost:4000/results/byTeam/${teamId}`);
            if (!response?.ok) {
                throw new Error('Error al cargar los resultados');
            }
            const results = await response.json();

            // Update name in all results where the team appears
            for (const result of results) {
                const isLocal = result.localTeamId === teamId;
                const updatedFields = isLocal ? { localTeam: newTeamName } : { visitorTeam: newTeamName };
    
                await fetch(`http://localhost:4000/results/${result._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...result, ...updatedFields }),
                });
            }
    
            // Refresh results from context
            await fetchResults();
            return response;
        } catch (error) {
            console.error("Error al actualizar nombres en resultados:", error);
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
            updateResultsWithNewTeamName,
        }}>
            {children}
        </TeamsAndResultsContext.Provider>
    );
};

export const useTeamsAndResults = () => useContext(TeamsAndResultsContext);
