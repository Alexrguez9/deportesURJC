import React, { createContext, useContext, useState, useEffect } from 'react';

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
            if (!response.ok) {
                throw new Error('Error al cargar los equipos');
            }
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            console.error("Error al cargar equipos:", error);
        }
    };

    const fetchResults = async () => {
        try {
            const response = await fetch('http://localhost:4000/encuentros');
            if (!response.ok) {
                throw new Error('Error al cargar los encuentros');
            }
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Error al cargar encuentros:", error);
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
            if (!response.ok) {
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

    const updateTeam = async (equipoId, updateData) => {
        try {
            const response = await fetch(`http://localhost:4000/equipos/${equipoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el equipo');
            }

            const updatedEquipo = await response.json();
            setTeams((prev) => prev.map((e) => (e._id === equipoId ? updatedEquipo : e)));
            return response;
        } catch (error) {
            console.error("Error al actualizar equipo:", error);
        }
    };

    const updateResult = async (encuentroId, updateData) => {
        try {
            const response = await fetch(`http://localhost:4000/encuentros/${encuentroId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el encuentro');
            }

            const updatedEncuentro = await response.json();
            setResults((prev) => prev.map((e) => (e._id === encuentroId ? updatedEncuentro : e)));
        } catch (error) {
            console.error("Error al actualizar encuentro:", error);
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

            if (!response.ok) {
                throw new Error('Error al borrar el equipo');
            }

            setTeams((prev) => prev.filter((e) => e._id !== teamId));
        } catch (error) {
            console.error("Error al borrar equipo:", error);
        }
    };

    const deleteResult = async (encuentroId) => {
        try {
            const response = await fetch(`http://localhost:4000/encuentros/${encuentroId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al borrar el encuentro');
            }

            setResults((prev) => prev.filter((e) => e._id !== encuentroId));
        } catch (error) {
            console.error("Error al borrar encuentro:", error);
        }
    };

    return (
        <TeamsAndResultsContext.Provider value={{ 
            teams, 
            results, 
            fetchTeams, 
            fetchResults,
            addTeam,
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
