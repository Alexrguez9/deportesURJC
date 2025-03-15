import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

// Crear el contexto
const FacilitiesAndReservationsContext = createContext();

// Proveedor del contexto
export const FacilitiesAndReservationsProvider = ({ children }) => {
    const [instalaciones, setInstalaciones] = useState([]);
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        getAllFacilities();
        getAllReservations();
    }, []);

    const getInstalacion = async (id) => {
        const instAux =  await instalaciones.find((instalacion) => instalacion._id === id);
        return instAux;
    };

    const getAllFacilities = async () => {
        try {
            const response = await fetch('http://localhost:4000/instalaciones');
            if (!response.ok) {
                console.error("Error al obtener la lista de instalaciones:", response.status);
                return null;
            }

            const facilities = await response.json();
            setInstalaciones(facilities);
            return facilities;
        } catch (error) {
            console.error("Error al cargar instalaciones:", error);
            return null;
        }
    };

    const getAllReservations = async () => {
        try {
            const response = await fetch('http://localhost:4000/reservas');
            if (!response.ok) {
                console.error("Error al obtener la lista de reservas:", response.status);
                return null;
            }
    
            const reservas = await response.json();
            setReservas(reservas);
            return reservas;
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            return null;
        }
    };

    const addReservation = async (reserva) => {
        try {
            const response = await fetch('http://localhost:4000/reservas', {
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

    const addFacility = async (facility) => {
        try {
            const response = await fetch('http://localhost:4000/instalaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facility),
            });

            if (!response.ok) {
                throw new Error('Error al agregar la instalación');
            }
            
            const newFacility = await response.json();
            setInstalaciones([...instalaciones, newFacility]);
            return response;
        } catch (error) {
            console.error("Error al agregar instalación:", error);
            return null;
        }
    };

    const updateReservation = async (reservaId, reserva) => {
        try {
            const response = await fetch(`http://localhost:4000/reservas/${reservaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reserva),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar la reserva');
            }
            await getAllReservations();
            return response;
        } catch (error) {
            console.error('Error al actualizar la reserva:', error);
        }
    };

    const updateFacility = async (instalacionId, instalacion) => {
        try {
            const response = await fetch(`http://localhost:4000/instalaciones/${instalacionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(instalacion),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar la instalación');
            }
            await getAllFacilities();
            return response;
        } catch (error) {
            console.error('Error al actualizar la instalación:', error);
        }
    };

    const deleteReservation = async (reservaId) => {
        try {
          const response = await fetch(`http://localhost:4000/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error('Error al eliminar la reserva');
          }
      
          await getAllReservations();
          return response;
      
        } catch (error) {
          console.error('Error al eliminar la reserva:', error);
          return error;
        }
    };

    const deleteFacility = async (instalacionId) => {
        try {
          const response = await fetch(`http://localhost:4000/instalaciones/${instalacionId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error('Error al eliminar la instalación');
          }
      
          await getAllFacilities();
          return response;
        } catch (error) {
          console.error('Error al eliminar la instalación:', error);
        }
    }

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
        <FacilitiesAndReservationsContext.Provider value={{ instalaciones, reservas, getInstalacion, getAllFacilities, getAllReservations, addReservation, addFacility, updateReservation, updateFacility, deleteReservation, deleteFacility, contarReservasPorFranjaHoraria }}>
            {children}
        </FacilitiesAndReservationsContext.Provider>
    );
};

export const useFacilitiesAndReservations = () => useContext(FacilitiesAndReservationsContext);
