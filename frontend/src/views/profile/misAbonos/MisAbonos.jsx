import { useEffect, Fragment } from 'react';
import { toast } from 'sonner';
import './MisAbonos.css';
import { useAuth } from '../../../context/AuthContext';
import { getPrettyDate } from '../../../utils/dates';
import { isSubscriptionExpired } from '../../../utils/user';

const MisAbonos = () => {
    const { user, updateUser } = useAuth();

    const handleBaja = (instalacion) => async () => {
        const updatedUserData  = { ...user };
        if (instalacion === 'gimnasio') {
            updatedUserData.subscription.gimnasio = { estado: false, fechaInicio: null, fechaFin: null };
        } else if (instalacion === 'atletismo') {
            updatedUserData.subscription.atletismo = { estado: false, fechaInicio: null, fechaFin: null};
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
    const altaStateGimnasio = user?.alta?.gimnasio?.estado;
    const altaStateAtletismo = user?.alta?.atletismo?.estado;
    const gimnasioAltaDateInit = getPrettyDate(user?.alta?.gimnasio?.fechaInicio);
    const atletismoAltaDateInit = getPrettyDate(user?.alta?.atletismo?.fechaInicio);

    // Subscriptions
    const subscriptionStateAtletismo = user?.subscription?.atletismo?.estado;
    const subscriptionStateGimnasio = user?.subscription?.gimnasio?.estado;
    const gimnasioSubsDateInit = getPrettyDate(user?.subscription?.gimnasio?.fechaInicio);
    const gimnasioSubsDateEnd = getPrettyDate(user?.subscription?.gimnasio?.fechaFin);
    const atletismoSubsDateInit = getPrettyDate(user?.subscription?.atletismo?.fechaInicio);
    const atletismoSubsDateEnd = getPrettyDate(user?.subscription?.atletismo?.fechaFin);
    const isGimnasioExpired = isSubscriptionExpired(user?.subscription?.gimnasio);
    const isAtletismoExpired = isSubscriptionExpired(user?.subscription?.atletismo);


    return (
        <div>
            <h1>Mis Abonos</h1>
            <div className='content-mis-abonos'>
                {user ? (
                    <div className="cards-container">
                        <div className="card-no-hover">
                            <p>Usuario: {user?.name}</p>
                            <p>Fecha alta: { altaStateGimnasio ? gimnasioAltaDateInit : 'No estás dado de alta'}</p>
                            <h2>GIMNASIO MENSUAL</h2>
                            { subscriptionStateGimnasio ? (
                                isGimnasioExpired ? (
                                    <p>Abono caducado</p>
                                ) : (
                                    <Fragment>
                                        <p>Abono activo</p>
                                        <p>Fecha alta: { gimnasioSubsDateInit }</p>
                                        <p>Fecha caducidad: { gimnasioSubsDateEnd }</p>
                                        {/* <p>{ user?.alta?.gimnasio?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                        <button
                                            onClick={()=> {
                                                toast.promise(handleBaja('gimnasio'), {
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
                            <p>Fecha de alta: { altaStateAtletismo ? atletismoAltaDateInit : 'No estás dado de alta' }</p>
                            <h2>ATLETISMO MENSUAL</h2>
                            { subscriptionStateAtletismo ? (
                                isAtletismoExpired ? (
                                    <p>Abono caducado</p>
                                ) : (
                                    <Fragment>
                                        <p>Abono activo</p>
                                        <p>Fecha inicio: { atletismoSubsDateInit }</p>
                                        <p>Fecha caducidad: { atletismoSubsDateEnd }</p>
                                        {/* <p>{ user?.alta?.atletismo?.fechaInicio?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                                        <button
                                            onClick={()=> {
                                                toast.promise(handleBaja('atletismo'), {
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

export default MisAbonos;