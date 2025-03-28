import { useState, useEffect } from "react";
import "./FitnessRoomsReservations.css";
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/backButton/BackButton';
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

const FitnessRoomsReservations = () => {
    const { getAllReservations } = useFacilitiesAndReservations();
    const [ reservations, setReservations] = useState([]);
    const [ filteredSport, setFilteredSport] = useState('Gimnasio');
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            const reservationsList = await getAllReservations();
            setReservations(reservationsList || []);
        })();
   }, []);
   
    const handleDeporteChange = (event) => {
        setFilteredSport(event.target.value);
    };

    // TODO: las reservas filtradas deben filtrarse por instalacion (solo tenemos el id de instalaciones)
    // TODO 2: para ello, hace falta importar todas las instalaciones como estado global. 
    // (también nos sirve para la view de reservas de instalaciones deportivas)

    return (
        <div id="component-content">
            <div className="back-button-div">
                <BackButton />
            </div>
            <h1>Reservas de sala de preparación física</h1>
            <p>Bienvenido a la página de Reservas de salas de preparación física URJC Deportes.</p>
            {user ? (
                user.registration.gym.isActive || user.registration.athletics.isActive ? (
                    <section>
                    <select value={filteredSport} onChange={handleDeporteChange}>
                        <option value="Gimnasio">Gimnasio</option>
                        <option value="Atletismo">Atletismo</option>
                    </select>
            
                    <p>PRÓXIMAMENTE...</p>
                    </section>
                ) : (
                    <div>
                    <Link to="/salas-preparacion/alta">
                        <p>Debes estar dado de alta en el servicio de deportes para poder reservar salas de preparación física.</p>
                        <button>Darme de alta</button>
                    </Link>
                    </div>
                )
            ) : (
            <div>
                <Link to="/login">
                <p>Debes iniciar sesión para poder reservar salas de preparación física.</p>
                <button>Iniciar sesión</button>
                </Link>
            </div>
            )}
        </div>
    );
}      
export default FitnessRoomsReservations;