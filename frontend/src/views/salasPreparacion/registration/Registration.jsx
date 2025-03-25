import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import './Registration.css';
import BackButton from "../../../components/backButton/BackButton";
import { getMonthlyDateRange, infinityDate } from "../../../utils/dates";

const Registration = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('Gimnasio');
    const { user, updateUser } = useAuth();

    useEffect(() => {
    }, [filtroDeporte]);

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };


    const handleRegistration = async () => {
        if(user) {
            console.log('---user---', user);
            if (user.registration.gym.isActive && user.registration.athletics.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en las dos instalaciones.' } };
            }
            if (filtroDeporte === 'Atletismo' && user.registration.athletics.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en athletics' } };
            }
            if (filtroDeporte === 'Gimnasio' && user.registration.gym.isActive) {
                throw { status: { ok: false, error: 'Ya estás dado de alta en gimnasio' } };
            }
            const { startDate } = getMonthlyDateRange(user);
            const updatedUserData  = { ...user };
            if (filtroDeporte === 'Gimnasio') {
                updatedUserData.registration.gym = { isActive: true, initDate: startDate, endDate: infinityDate };
            } else if (filtroDeporte === 'Atletismo') {
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
    
    // TODO: hacer simulación de pasarela de pago para externos

    return (
        <div id="component-content" className="content">
            <div className="back-button-div">
                <BackButton />
            </div>
            <h1>Alta de sala de preparación física</h1>
            <p>Bienvenido a la página de Alta de salas de preparación física URJC Deportes.
            <br />Aquí podrás darte de alta en <strong>Gimnasio o Atletismo</strong> de la URJC.
            </p>
            <section>
                <select value={filtroDeporte} onChange={handleDeporteChange}>
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