const model = require('../models/Reservas');

// obtener data de reservas
exports.getData = async (req, res) => {
    const reservasData = await model.find();
    res.json(reservasData);
}

// insertar data en reservas
exports.insertData = async (req, res) => {
    try {
        // destructuring de propiedades de la reserva
        const { userId, instalacionId, fechaInicio, fechaFin, precioTotal }  = req.body;

        // Validar los datos necesarios
        if (!userId || !instalacionId || !fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Crear nueva reserva
        const newReserva = new model({
            userId,
            instalacionId,
            fechaInicio,
            fechaFin,
            precioTotal
        });

        // Guardar reserva en la base de datos
        const savedReserva = await newReserva.save();
        res.status(201).json(savedReserva);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos de reserva', message: error.message });
    }
};

// editar una reserva
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedReserva = await model.updateOne({ _id: id }, { $set: body });

        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (updatedReserva.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró la reserva para actualizar' });
        } else {
            res.json({ message: 'Reserva actualizada exitosamente', updatedReserva });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos de la reserva', message: error.message });
    }
}

// eliminar una reserva
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReserva = await model.deleteOne({ _id: id });
        
        // Respuesta al cliente. EVITAMOS ERROR: si no damos respuesta, se quedará cargando el front
        if (deletedReserva.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró la reserva para eliminar' });
        } else {
            res.json({ message: 'Reserva eliminada exitosamente', deletedReserva });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos de la reserva', message: error.message });
    }
}