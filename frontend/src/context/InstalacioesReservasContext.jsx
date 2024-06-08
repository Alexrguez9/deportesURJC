import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const InstalacionesReservasContext = createContext();

// Proveedor del contexto
export const InstalacionesReservasProvider = ({ children }) => {
    const [instalaciones, setInstalaciones] = useState([]);
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        fetchInstalaciones();
        fetchReservas();
    }, []);

    const getInstalacion = (id) => {
        const instAux =  instalaciones.find((instalacion) => instalacion._id === id);
        return instAux;
    };

    const fetchInstalaciones = async () => {
        try {
            const response = await fetch('http://localhost:3000/instalaciones');
            if (!response.ok) {
                throw new Error('Error en el fetch de instalaciones');
                
            }
            const data = await response.json();
            
            setInstalaciones(data);
        } catch (error) {
            console.error("Error al cargar instalaciones instalaciones:", error);
        }
    };

    const fetchReservas = async () => {
        try {
            const response = await fetch('http://localhost:3000/reservas');
            if (!response.ok) {
                throw new Error('Error en el fetch de reservas');
            }
            const data = await response.json();
            setReservas(data);

        } catch (error) {
            console.error("Error al cargar instalaciones reservas:", error);
        }
    };

    const postReserva = async (reserva) => {
        try {
            const response = await fetch('http://localhost:3000/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reserva),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Error en el fetch de post reserva');
            }
            const data = await response.json();
            setReservas([...reservas, data]);
            return response;
        } catch (error) {
            console.error("Error al postear reserva:", error);
            return error;
        }
    };

    const deleteReserva = async (reservaId) => {
        try {
          const response = await fetch(`http://localhost:3000/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error('Error al eliminar la reserva');
          }
      
          await fetchReservas();
      
        } catch (error) {
          console.error('Error al eliminar la reserva:', error);
        }
    };

    const contarReservasPorFranjaHoraria = async (instalacionId, fechaInicio) => {
        const hora = fechaInicio.getHours();
        const minutos = fechaInicio.getMinutes();
      
        // Filtramos las reservas por instalación y fecha
        const reservasFiltradas = reservas.filter(
            (reserva) => {
              const reservaDate = typeof reserva.fechaInicio === 'object' && reserva.fechaInicio instanceof Date ? reserva.fechaInicio : new Date(reserva.fechaInicio);
        
              return (
                reserva.instalacionId === instalacionId &&
                reservaDate.getDate() === fechaInicio.getDate() &&
                reservaDate.getMonth() === fechaInicio.getMonth() &&
                reservaDate.getFullYear() === fechaInicio.getFullYear() &&
                reservaDate.getHours() === hora &&
                reservaDate.getMinutes() === minutos
              );
            }
        );
      
        return reservasFiltradas.length;
    };

    return (
        <InstalacionesReservasContext.Provider value={{ instalaciones, reservas, getInstalacion, fetchInstalaciones, fetchReservas, postReserva, deleteReserva, contarReservasPorFranjaHoraria }}>
            {children}
        </InstalacionesReservasContext.Provider>
    );
};

// Custom hook para usar el contexto
export const useInstalacionesReservas = () => useContext(InstalacionesReservasContext);
