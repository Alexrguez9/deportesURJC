import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import API_URL from "../config/env";

const FacilitiesAndReservationsContext = createContext();

export const FacilitiesAndReservationsProvider = ({ children }) => {
    const [facilities, setFacilities] = useState([]);
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        getAllFacilities();
        getAllReservations();
    }, []);

    const getFacility = async (id) => {
        const instAux =  await facilities.find((facility) => facility._id === id);
        return instAux;
    };

    const getAllFacilities = async () => {
        try {
            const response = await fetch(`${API_URL}/facilities`);
            if (!response.ok) {
                console.error("Error al obtener la lista de instalaciones:", response.status);
                return null;
            }

            const facilities = await response.json();
            setFacilities(facilities);
            return facilities;
        } catch (error) {
            console.error("Error al cargar instalaciones:", error);
            return null;
        }
    };

    const getAllReservations = async () => {
        try {
            const response = await fetch(`${API_URL}/reservations`);
            if (!response.ok) {
                console.error("Error al obtener la lista de reservas:", response.status);
                return null;
            }
    
            const reservations = await response.json();
            setReservations(reservations);
            return reservations;
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            return null;
        }
    };

    const addReservation = async (reserva) => {
        try {
            const response = await fetch(`${API_URL}/reservations`, {
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
            setReservations([...reservations, data]);
            return response;
        } catch (error) {
            console.error("Error al postear reserva:", error);
            return error;
        }
    };

    const addFacility = async (facility) => {
        try {
            const response = await fetch(`${API_URL}/facilities`, {
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
            setFacilities([...facilities, newFacility]);
            return response;
        } catch (error) {
            console.error("Error al agregar instalación:", error);
            return null;
        }
    };

    const updateReservation = async (reservaId, reserva) => {
        try {
            const response = await fetch(`${API_URL}/reservations/${reservaId}`, {
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

    const updateFacility = async (facilityId, facility) => {
        try {
            const response = await fetch(`${API_URL}/facilities/${facilityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(facility),
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
          const response = await fetch(`${API_URL}/reservations/${reservaId}`, {
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

    const deleteFacility = async (facilityId) => {
        try {
          const response = await fetch(`${API_URL}/facilities/${facilityId}`, {
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

    const countReservationsByTimeSlot = async (facilityId, initDate) => {
        const hour = initDate.getHours();
        const minutos = initDate.getMinutes();
      
        // Filter reservations by facilityId and date
        const reservasFiltradas = reservations.filter(
            (reserva) => {
              const reservaDate = typeof reserva.initDate === 'object' && reserva.initDate instanceof Date
              ? reserva.initDate
              : new Date(reserva.initDate);
        
              return (
                reserva.facilityId === facilityId &&
                reservaDate.getDate() === initDate.getDate() &&
                reservaDate.getMonth() === initDate.getMonth() &&
                reservaDate.getFullYear() === initDate.getFullYear() &&
                reservaDate.getHours() === hour &&
                reservaDate.getMinutes() === minutos
              );
            }
        );
      
        return reservasFiltradas.length;
    };

    return (
        <FacilitiesAndReservationsContext.Provider value={{
            facilities,
            reservations,
            getFacility,
            getAllFacilities,
            getAllReservations,
            addReservation,
            addFacility,
            updateReservation,
            updateFacility,
            deleteReservation,
            deleteFacility,
            countReservationsByTimeSlot
        }}>
            {children}
        </FacilitiesAndReservationsContext.Provider>
    );
};

export const useFacilitiesAndReservations = () => useContext(FacilitiesAndReservationsContext);
