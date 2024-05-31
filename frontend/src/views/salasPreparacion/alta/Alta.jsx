import React, { useState } from "react";
import { useAuth } from '../../../context/AuthContext';

const Alta = () => {
    const [filtroDeporte, setFiltroDeporte] = useState('');
    const { user, setUser, updateUser } = useAuth();

    const handleDeporteChange = (event) => {
        setFiltroDeporte(event.target.value);
    };

    const handleAlta = async () => {
        if(user) {
            if (user.estado_alta.gimnasio && user.estado_alta.atletismo) {
                alert('Ya estás dado de alta en las dos instalaciones.');
                return;
            }
        
            const updateData = {};
            if (filtroDeporte === 'Gimnasio') {
                updateData.estado_alta = { gimnasio: true, atletismo: user.estado_alta.atletismo };
            } else if (filtroDeporte === 'Atletismo') {
                updateData.estado_alta = { atletismo: true, gimnasio: user.estado_alta.gimnasio };
            }
        
            try {
                const response = await updateUser(user._id, updateData);
                
                if (response.status === 200) {
                    alert('¡Alta completada con éxito!');
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

    return (
        <div id="alta-content">
            <h1>Alta de sala de preparación física</h1>
            <p>Bienvenido a la página de Alta de salas de preparación física URJC Deportes.</p>
            <section>
                <select value={filtroDeporte} onChange={handleDeporteChange}>
                    <option value="">Escoge una opción</option>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Atletismo">Atletismo</option>
                </select>
                <div>
                    {user ? <button onClick={handleAlta}>Darme de alta</button>: <p>Debes iniciar sesión para poder darte de alta</p>}
                </div>
            </section>
        </div>
    );
}
export default Alta;