const model = require('../models/Reservas');

// Get all data from Reservas
exports.getData = async (req, res) => {
    const reservasData = await model.find();
    res.json(reservasData);
}

// Add new reservation
exports.insertData = async (req, res) => {
    try {
        const { userId, instalacionId, fechaInicio, fechaFin, precioTotal, isPaid }  = req.body;

        if (!userId || !instalacionId || !fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const newReserva = new model({
            userId,
            instalacionId,
            fechaInicio,
            fechaFin,
            precioTotal,
            isPaid
        });

        const savedReserva = await newReserva.save();
        res.status(201).json(savedReserva);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar datos de reserva', message: error.message });
    }
};

// Update a reservation
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedReserva = await model.updateOne({ _id: id }, { $set: body });

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

// Delete a reservation
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReserva = await model.deleteOne({ _id: id });
        
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