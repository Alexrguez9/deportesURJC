import { useState } from "react";
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentForm from "../../../components/paymentSimulation/PaymentSimulation";
import { sendEmail } from '../../../utils/mails';
import './PagoAbono.css';
import { studentsPricesMessage, externalPrice } from './CONSTANTS';
import BackButton from '../../../components/backButton/BackButton';
import Spinner from '../../../components/spinner/Spinner';
import { toast } from 'sonner';
import { getDateWithoutTime, getMonthlyDateRange } from "../../../utils/dates";

const PagoAbono = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('Gimnasio');
    const { user, updateUser, isStudent, isAdmin } = useAuth();
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);

    const altaGymState = user?.alta?.gimnasio?.estado;
    const altaAtletismoState = user?.alta?.atletismo?.estado;

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handlePago = async () => {
        setIsLoading(true);
        console.log('---isLoading---', isLoading);
        if (user) {
            const {startDate, endDate} = getMonthlyDateRange(user);

            if (!startDate || !endDate) {
                toast.error('No se pudo calcular la fecha de renovación. Por favor verifica los datos.');
                setIsLoading(false);
                return;
            }

            const updateData = { ...user };
            /* istanbul ignore else */
            if (filtroDeporte === 'Gimnasio') {
                updateData.subscription.gimnasio = { estado: true, fechaInicio: startDate, fechaFin: endDate };
            } else if (filtroDeporte === 'Atletismo') {
                updateData.subscription.atletismo = { estado: true, fechaInicio: startDate, fechaFin: endDate };
            }else {
                toast.error('Escoge Gimnasio o Atletismo por favor.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await updateUser(user._id, updateData);
                setTimeout(() => {
                    setIsLoading(false);
                    if (response.status === 200) {
                        toast.success('Pago completado con éxito!');
                        sendEmail(
                            user.email,
                            'DeportesURJC - Confirmación de Pago de abono',
                            `Hola ${user.name},\n\n` +
                            `Tu pago del Abono de ${filtroDeporte} ha sido completado con éxito.\n¡Nos vemos pronto!\n\n` +
                            `Gracias por utilizar nuestro servicio.\nDeportes URJC`
                        );
                    } else {
                        console.error('Error al actualizar el usuario:', response.data.message);
                        toast.error('Error al dar de alta. Inténtalo de nuevo más tarde.');
                    }
                });
            } catch (error) {
                console.error('Error al dar de alta:', error);
                toast.error('Se ha producido un error al dar de alta. Inténtalo de nuevo.');
                setIsLoading(false);
            }
        }
    };

    const handleAlta = () => {
        navigate('/salas-preparacion/alta');
    };

    return (
        <div id="component-content" className="content">
            <div className="back-button-div">
                <BackButton />
            </div>
            <h1>Pago Abono</h1>
            <p>Bienvenido a la página de pago del abono de atletismo o gimnasio de la URJC.
                <br />Aquí podrás abonar <b>por 30 días</b> tu abono de atletismo o gimnasio.
                <br />Coste del abono: <b> {isStudent() ? studentsPricesMessage : externalPrice + '€'} </b>
            </p>
            {user ? (
                ( altaGymState || altaAtletismoState ) ? (
                    <section>
                        <select value={filtroDeporte} onChange={handleDeporteChange}>
                            <option value="Gimnasio">Gimnasio</option>
                            <option value="Atletismo">Atletismo</option>
                        </select>
                        {filtroDeporte === 'Gimnasio' && !altaGymState || filtroDeporte === 'Atletismo' && !altaAtletismoState
                            ? <p>No estás dado de alta en {filtroDeporte}</p>
                            :
                            <div className="centered-div button-alta">
                                <p>Inicio abono: { filtroDeporte === 'Gimnasio' ? getDateWithoutTime(user?.subscription?.gimnasio?.fechaInicio) : getDateWithoutTime(user?.subscription?.atletismo?.fechaInicio) }
                                <br />Expiración abono: { filtroDeporte === 'Gimnasio' ? getDateWithoutTime(user?.subscription?.gimnasio?.fechaFin) : getDateWithoutTime(user?.subscription?.atletismo?.fechaFin) }</p>
                                {isStudent() || isAdmin() ? (
                                    user?.subscription?.[filtroDeporte.toLowerCase()]?.estado ? (
                                        <button onClick={handlePago}>Renovar gratis</button>
                                    ) : (
                                        <button onClick={handlePago}>Obtener gratis</button>
                                    )
                                )
                                    : <PaymentForm externalPrice={externalPrice} onPayment={handlePago} />
                                }
                            </div>
                        }
                        {isLoading && <Spinner />}
                    </section>
                ) : (
                    <div>
                        <p className="text-error">
                            No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).
                        </p>
                        <button onClick={handleAlta}>Alta de usuarios</button>
                    </div>
                )
            ) : (
                <p>Debes iniciar sesión para poder pagar o renovar tu abono</p>
            )
            }
        </div>
    );
}
export default PagoAbono;