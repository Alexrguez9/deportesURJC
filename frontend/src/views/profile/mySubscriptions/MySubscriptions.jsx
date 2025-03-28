import { useEffect, Fragment } from 'react';
import { toast } from 'sonner';
import './MySubscriptions.css';
import { useAuth } from '../../../context/AuthContext';
import { getPrettyDate } from '../../../utils/dates';
import { isSubscriptionExpired } from '../../../utils/user';

const MySubscriptions = () => {
    const { user, updateUser } = useAuth();

    const handleUnsubscribe = (facility) => async () => {
        const updatedUserData  = { ...user };
        if (facility === 'gym') {
            updatedUserData.subscription.gym = { isActive: false, initDate: null, endDate: null };
        } else if (facility === 'athletics') {
            updatedUserData.subscription.athletics = { isActive: false, initDate: null, endDate: null};
        }
        try {
            await updateUser(user._id, updatedUserData );
        } catch (error) {
            console.error('Error al dar de baja:', error);
            throw { status: { ok: false, error: 'Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.' } };
        }
    }

    useEffect(() => {
    }, []);

    // Altas
    const registrationGym = user?.registration?.gym?.isActive;
    const registrationAthletics = user?.registration?.athletics?.isActive;
    const gymRegistrationDateInit = getPrettyDate(user?.registration?.gym?.initDate);
    const athleticsRegistrationDateInit = getPrettyDate(user?.registration?.athletics?.initDate);

    // Subscriptions
    const subscriptionStateAtletismo = user?.subscription?.athletics?.isActive;
    const subscriptionStateGimnasio = user?.subscription?.gym?.isActive;
    const gymSubsDateInit = getPrettyDate(user?.subscription?.gym?.initDate);
    const gymSubsDateEnd = getPrettyDate(user?.subscription?.gym?.endDate);
    const athleticsSubsDateInit = getPrettyDate(user?.subscription?.athletics?.initDate);
    const athleticsSubsDateEnd = getPrettyDate(user?.subscription?.athletics?.endDate);
    const isGymExpired = isSubscriptionExpired(user?.subscription?.gym);
    const isAthleticsExpired = isSubscriptionExpired(user?.subscription?.athletics);


    return (
        <div>
            <h1>Mis Abonos</h1>
            <div className='content-mis-abonos'>
                {user ? (
                    <div className="cards-container">
                        <div className="card-no-hover">
                            <p>Usuario: {user?.name}</p>
                            <p>Fecha alta: { registrationGym ? gymRegistrationDateInit : 'No estás dado de alta'}</p>
                            <h2>GIMNASIO MENSUAL</h2>
                            { subscriptionStateGimnasio ? (
                                isGymExpired ? (
                                    <p>Abono caducado</p>
                                ) : (
                                    <Fragment>
                                        <p>Abono activo</p>
                                        <p>Fecha alta: { gymSubsDateInit }</p>
                                        <p>Fecha caducidad: { gymSubsDateEnd }</p>
                                        {/* <p>{ user?.registration?.gym?.initDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                        <button
                                            onClick={()=> {
                                                toast.promise(handleUnsubscribe('gym'), {
                                                    loading: 'Dando de baja...',
                                                    success: 'Baja completada con éxito!',
                                                    error: (err) => {
                                                        return err?.status?.error || 'Error al dar de baja. Inténtalo de nuevo más tarde.';
                                                    },
                                                    duration: 3000,
                                                })
                                            }}>Darme de baja</button>
                                    </Fragment>
                                )
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                        </div>
                        <div className="card-no-hover">
                            <p>Usuario: {user?.name}</p>
                            <p>Fecha de alta: { registrationAthletics ? athleticsRegistrationDateInit : 'No estás dado de alta' }</p>
                            <h2>ATLETISMO MENSUAL</h2>
                            { subscriptionStateAtletismo ? (
                                isAthleticsExpired ? (
                                    <p>Abono caducado</p>
                                ) : (
                                    <Fragment>
                                        <p>Abono activo</p>
                                        <p>Fecha inicio: { athleticsSubsDateInit }</p>
                                        <p>Fecha caducidad: { athleticsSubsDateEnd }</p>
                                        {/* <p>{ user?.registration?.athletics?.initDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                        <button
                                            onClick={()=> {
                                                toast.promise(handleUnsubscribe('athletics'), {
                                                    loading: 'Dando de baja...',
                                                    success: 'Baja completada con éxito!',
                                                    error: (err) => {
                                                        return err?.status?.error || 'Error al dar de baja. Inténtalo de nuevo más tarde.';
                                                    },
                                                    duration: 3000,
                                                })
                                            }}>Darme de baja</button>
                                    </Fragment>
                                )
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                        </div>
                    </div>
                ): <p>Debes iniciar sesión para acceder a tus abonos</p>}
            </div>
        </div>
    );
};

export default MySubscriptions;