import { useEffect, Fragment } from 'react';
import { toast } from 'sonner';
import './MisAbonos.css';
import { useAuth } from '../../../context/AuthContext';
import { getPrettyDate } from '../../../utils/dates';

const MisAbonos = () => {
    const { user, updateUser } = useAuth();

    const handleBaja = (instalacion) => async () => {
        if(user) {
            const updatedUserData  = { ...user };
            if (instalacion === 'gimnasio') {
                updatedUserData.alta.gimnasio = { estado: false, fechaInicio: null, fechaFin: null };
            } else if (instalacion === 'atletismo') {
                updatedUserData.alta.atletismo = { estado: false, fechaInicio: null, fechaFin: null};
            }
            try {
                const response = await updateUser(user._id, updatedUserData );
                if (response.status !== 200) {
                    throw { status: { ok: false, error: 'Error al dar de baja. Inténtalo de nuevo más tarde' } };
                }
            } catch (error) {
                console.error('Error al dar de baja:', error);
                throw { status: { ok: false, error: 'Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.' } };
            }
        }
    }

    useEffect(() => {
    }, []);

    const estadoAtletismo = user?.alta?.atletismo?.estado;
    const estadoGimnasio = user?.alta?.gimnasio?.estado;
    const fechaInicioGimnasio = getPrettyDate(user?.alta?.gimnasio?.fechaInicio)
    const fechaFinGimnasio = getPrettyDate(user?.alta?.gimnasio?.fechaFin)
    const fechaInicioAtletismo = getPrettyDate(user?.alta?.atletismo?.fechaInicio)
    const fechaFinAtletismo = getPrettyDate(user?.alta?.atletismo?.fechaFin)
    return (
        <div>
            <h1>Mis Abonos</h1>
            <div className='content-mis-abonos'>
                {user ? (
                    <div className="cards-container">
                        <div className="card-no-hover">
                            <p>Usuario: {user?.name}</p>
                            <h2>GIMNASIO MENSUAL</h2>
                            {estadoGimnasio ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>Fecha inicio: { fechaInicioGimnasio }</p>
                                    <p>Fecha caducidad: { fechaFinGimnasio }</p>
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
                            ) : (
                                <p>Abono inactivo</p>
                            )}
                        </div>

                        <div className="card-no-hover">
                            <p>Usuario: {user?.name}</p>
                            <h2>ATLETISMO MENSUAL</h2>
                            {estadoAtletismo ? (
                                <Fragment>
                                    <p>Abono activo</p>
                                    <p>Fecha inicio: { fechaInicioAtletismo }</p>
                                    <p>Fecha caducidad: { fechaFinAtletismo }</p>
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