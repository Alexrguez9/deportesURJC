import React, { useState } from "react";
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PagoAbono.css';
import BackButton from '../../../components/backButton/BackButton';

const PagoAbono = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('');
    const { user, updateUser } = useAuth();
    const navigate = useNavigate()
    const [successMessage, setSuccessMessage] = useState('');

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handlePago = async () => {
        if(user) {
            if (!user.alta.gimnasio && !user.alta.atletismo) {
                alert('No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).');
                return;
            }
        
            const updateData = {};
            if (filtroDeporte === 'Gimnasio') {
                updateData.alta = { gimnasio: true, atletismo: user.alta.atletismo };
            } else if (filtroDeporte === 'Atletismo') {
                updateData.alta = { atletismo: true, gimnasio: user.alta.gimnasio };
            } else {
                alert('Escoge Gimnasio o Atletismo por favor.');
                return;
            }
        
            try {
                const response = await updateUser(user._id, updateData);
                
                if (response.status === 200) {
                    setSuccessMessage('¡Alta completada con éxito!');
                } else {
                    console.error('Error al actualizar el usuario:', response.data.message);
                    alert('Error al dar de alta. Inténtalo de nuevo más tarde.');
                }
            } catch (error) {
                console.error('Error al dar de alta:', error);
                alert('Error al dar de alta2. Inténtalo de nuevo.');
            }
        }
    };

    const handleAlta = () => {
            navigate('/salas-preparacion/alta'); 
    };
    
    // TODO: hacer simulación de pasarela de pago

    return (
        <div id="component-content">
                <div className="back-button-div">
                    <BackButton />
                </div>
            <h1>Pago Abono</h1>
            <p>Bienvenido a la página de pago del abono de atletismo o gimnasio de la URJC.
                <br />Aquí podrás abonar por 30 días más tu abono de atletismo o gimnasio.
            </p>
            {user ? ( user.alta.gimnasio.estado || user.alta.atletismo.estado ? (
                    <section>
                        <select value={filtroDeporte} onChange={handleDeporteChange}>
                            <option value="">Escoge una opción</option>
                            <option value="Gimnasio">Gimnasio</option>
                            <option value="Atletismo">Atletismo</option>
                        </select>
                        <div className="button-alta">
                            <button onClick={handlePago}>Darme de alta</button>
                        </div>
                        {successMessage && <div className="success-message">{successMessage}</div>}
                    </section>
                    
                ) : ( 
                        <div>
                            <p>No estás dado de alta en ninguna instalación de preparación física (gimnasio o atletismo).</p>
                            <button onClick={handleAlta}>Alta de usuarios</button>
                        </div>
                    )

                
                
            ): ( <p>Debes iniciar sesión para poder darte de alta</p>) 
            }
        </div>
    );
}
export default PagoAbono;