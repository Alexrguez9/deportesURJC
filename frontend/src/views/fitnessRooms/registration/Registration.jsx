import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import './Registration.css';
import BackButton from "../../../components/backButton/BackButton";
import { getMonthlyDateRange, infinityDate } from "../../../utils/dates";

const Registration = () => {
    const [filteredSport, setfilteredSport] = useState('Gimnasio');
    const { user, updateUser } = useAuth();

    useEffect(() => {
    }, [filteredSport]);

    const handleDeporteChange = (event) => {
        setfilteredSport(event.target.value);
    };


    const handleRegistration = async () => {
        if(user) {
            if (user.registration.gym.isActive && user.registration.athletics.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en las dos instalaciones.' } };
            }
            if (filteredSport === 'Atletismo' && user.registration.athletics.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en athletics' } };
            }
            if (filteredSport === 'Gimnasio' && user.registration.gym.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en gimnasio' } };
            }
            const { startDate } = getMonthlyDateRange(user);
            const updatedUserData  = { ...user };
            if (filteredSport === 'Gimnasio') {
                updatedUserData.registration.gym = { isActive: true, initDate: startDate, endDate: infinityDate };
            } else if (filteredSport === 'Atletismo') {
                updatedUserData.registration.athletics = { isActive: true, initDate: startDate, endDate: infinityDate };
            } else {
                throw { status: { ok: false, error: 'Escoja una opción válida por favor.' } };
            }
            try {
                const response = await updateUser(user._id, updatedUserData);
                if (!response.ok) {
                    throw { status: { ok: false, error: 'Error al dar de alta. No se ha podido actulizar tu usuario' } };
                }
            } catch (error) {
                throw { status: { ok: false, error: 'Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.' } };
            }
        }
    };

    return (
        <div id="component-content" className="content">
             <div className="top-buttons-content">
                <BackButton />
            </div>
            <h1>Alta de sala de preparación física</h1>
            <p>Bienvenido a la página de Alta de salas de preparación física URJC Deportes.
            <br />Aquí podrás darte de alta en <strong>Gimnasio o Atletismo</strong> de la URJC.
            </p>
            <section>
                <select value={filteredSport} onChange={handleDeporteChange}>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                </select>
                <div className="button-alta">
                    {user ?
                        <button 
                            className="button-light" 
                            onClick={()=> {
                                toast.promise(() => handleRegistration(), {
                                    loading: 'Dando de alta...',
                                    success: 'Alta completada con éxito!',
                                    error: (err) => {
                                        return err?.status?.error || 'Error al dar de alta. Inténtalo de nuevo más tarde.';
                                    },
                                })
                            }}>Darme de alta</button> 
                        : <p>Debes iniciar sesión para poder darte de alta</p>}
                </div>
            </section>
        </div>
    );
}
export default Registration;